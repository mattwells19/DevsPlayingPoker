import type { RoomSchema, User, Voter } from "../types/schemas.ts";
import {
	JoinEvent,
	RoomUpdateEvent,
	ConnectEvent,
	OptionSelectedEvent,
	ModeratorChangeEvent,
	KickedEvent,
	StartVotingEvent,
	StopVotingEvent,
	KickVoterEvent,
	WebScoketMessageEvent,
} from "../types/socket.ts";
import calculateConfidence from "../utils/calculateConfidence.ts";
import connectToDb from "../utils/db.ts";
import constants from "../utils/constants.ts";

const { rooms, sessions } = await connectToDb();

const sockets = new Map<string, WebSocket>();

// update/prune user sessions
setInterval(async () => {
	const allSessions = await sessions
		.find({ environment: constants.environment })
		.toArray();
	const promises = [];

	for (const sess of allSessions) {
		const sessionExpired = sess.maxAge < Date.now();

		if (sessionExpired) {
			let updatePromise = null;

			if (sockets.has(sess._id.toString())) {
				// revalidate session since socket is still alive
				updatePromise = sessions.updateOne(
					{ _id: sess._id },
					{
						$set: {
							maxAge: Date.now() + constants.sessionTimeout,
						},
					},
				);
			} else {
				updatePromise = sessions.deleteOne({ _id: sess._id });
			}

			promises.push(updatePromise);
		}
	}

	await Promise.all(promises);
}, 60 * 1000);

/**
 * Utils
 */

/**
 * Sends updated roomData to all voters and moderator in room
 * @param roomData
 * @returns void
 */
const sendRoomData = (roomData: RoomSchema | undefined): void => {
	if (!roomData) {
		throw new Error(`Failed to send updatedRoomData. No roomData found.`);
	}
	const roomUpdateEvent: RoomUpdateEvent = {
		event: "RoomUpdate",
		roomData: roomData,
	};

	if (roomData.moderator) {
		const moderatorSock = sockets.get(roomData.moderator.id);

		if (moderatorSock && moderatorSock.readyState === WebSocket.OPEN) {
			moderatorSock.send(JSON.stringify(roomUpdateEvent));
		}
	}

	for (const voter of roomData.voters) {
		const voterSock = sockets.get(voter.id.toString());

		if (voterSock && voterSock.readyState === WebSocket.OPEN) {
			voterSock.send(JSON.stringify(roomUpdateEvent));
		}
	}
};

/**
 * Event Handlers
 */

interface EventFunctionError {
	message: string;
}

interface SocketContext {
	userId: string;
	userAlreadyExists: boolean;
}

type EventFunction<Event extends WebScoketMessageEvent> = (
	roomData: RoomSchema,
	context: SocketContext,
	event: Event,
) => Promise<EventFunctionError | void> | (EventFunctionError | void);

/**
 * Adds a player to the room specified either as a moderator or voter.
 * @param userId ID of the user joining
 * @param data JoinEvent data
 * @returns Whether the person who joined is the moderator of the room
 */
const handleJoin: EventFunction<JoinEvent> = async (
	roomData,
	{ userId, userAlreadyExists },
	data,
) => {
	if (userAlreadyExists) {
		sendRoomData(roomData);
		return;
	}

	const isModerator = !roomData.moderator;

	const updatedRoomData = await rooms.findAndModify(
		{ _id: roomData._id },
		{
			update: !isModerator
				? {
						$push: {
							voters: {
								$each: [
									{
										id: userId,
										name: data.name,
										confidence: null,
										selection: null,
									},
								],
							},
						},
				  }
				: { $set: { moderator: { id: userId, name: data.name } } },
			new: true,
		},
	);

	sendRoomData(updatedRoomData);
};

/**
 * Removes the user from the room and performs moderator migration if necessary
 * @param userId ID of the user leaving
 * @param roomCode 4-character code for the room
 * @returns void
 */
const handleLeave = async (
	roomData: RoomSchema,
	userId: string,
): Promise<void> => {
	let updatedRoomData: RoomSchema | undefined;

	if (roomData.moderator && roomData.moderator.id === userId) {
		if (roomData.voters.length > 0) {
			const newModerator = roomData.voters[0];

			updatedRoomData = await rooms.findAndModify(
				{ _id: roomData._id },
				{
					update: {
						$set: {
							moderator: { id: newModerator.id, name: newModerator.name },
						},
						$pull: { voters: { id: newModerator.id } },
					},
					new: true,
				},
			);
		} else {
			// if the moderator left and there's no one else in the room, delete the room
			await rooms.deleteOne({ _id: roomData._id });
			return;
		}
	} else {
		updatedRoomData = await rooms.findAndModify(
			{
				_id: roomData._id,
			},
			{
				update: {
					$pull: { voters: { id: userId } },
				},
				new: true,
			},
		);
	}

	sendRoomData(updatedRoomData);
};

/**
 * Begins voting, clearing previous votes
 * @param roomCode 4-character code for the room
 * @returns void
 */
const handleStartVoting: EventFunction<StartVotingEvent> = async (roomData) => {
	const updatedVoters = roomData.voters.map((voter) => ({
		id: voter.id,
		name: voter.name,
		selection: null,
		confidence: null,
	}));

	const updatedRoomData = await rooms.findAndModify(
		{ _id: roomData._id },
		{
			update: {
				$set: {
					state: "Voting",
					voters: updatedVoters,
					votingStartedAt: new Date(),
				},
			},
			new: true,
		},
	);

	sendRoomData(updatedRoomData);
};

/**
 * Ends voting, transitioning to "Results" state
 * @param roomCode 4-character code for the room
 * @returns void
 */
const handleStopVoting: EventFunction<StopVotingEvent> = async (roomData) => {
	const updatedRoomData = await rooms.findAndModify(
		{ _id: roomData._id },
		{
			update: {
				$set: {
					state: "Results",
				},
			},
			new: true,
		},
	);

	sendRoomData(updatedRoomData);
};

/**
 * Updates voter selection and confidence.  Sends updated roomdata
 * @param userId
 * @param roomCode 4-character code for the room
 * @param data OptionSelectedEvent data
 * @returns void
 */
const handleOptionSelected: EventFunction<OptionSelectedEvent> = async (
	roomData,
	{ userId },
	data,
) => {
	if (!roomData.options.includes(data.selection)) {
		return {
			message: "Invalid option selected.",
		};
	}

	const updatedVoters = roomData.voters.map((voter) => {
		if (voter.id === userId) {
			return {
				...voter,
				selection: data.selection,
				confidence: calculateConfidence(roomData.votingStartedAt),
			};
		}
		return voter;
	});

	const updatedRoomData = await rooms.findAndModify(
		{ _id: roomData._id },
		{
			update: {
				$set: {
					voters: updatedVoters,
				},
			},
			new: true,
		},
	);

	sendRoomData(updatedRoomData);
};

/**
 * Updates moderator to existing voter.  Adds former moderator to list of voters.
 * @param roomCode 4-character code for the room
 * @param data ModeratorChangeEvent data including new moderatorId
 * @returns void
 */
const handleModeratorChange: EventFunction<ModeratorChangeEvent> = async (
	roomData,
	_,
	data,
) => {
	const votersWithoutNewModerator = roomData.voters.filter(
		(voter) => voter.id !== data.newModeratorId,
	);

	// validated by validateModerator function
	const newVoter: Voter = {
		id: roomData.moderator!.id,
		name: roomData.moderator!.name,
		confidence: null,
		selection: null,
	};
	const updatedVoters = [...votersWithoutNewModerator, newVoter];

	const newModerator = roomData.voters.find(
		(voter) => voter.id === data?.newModeratorId,
	);

	if (!newModerator) {
		return {
			message: "Unable to find new moderator information",
		};
	}

	const updatedModerator: User = {
		id: data.newModeratorId,
		name: newModerator.name,
	};

	const updatedRoomData = await rooms.findAndModify(
		{ _id: roomData._id },
		{
			update: {
				$set: {
					voters: updatedVoters,
					moderator: updatedModerator,
				},
			},
			new: true,
		},
	);

	sendRoomData(updatedRoomData);
};

const handleKickVoter: EventFunction<KickVoterEvent> = async (
	roomData,
	_,
	{ voterId },
) => {
	const updatedRoomData = await rooms.findAndModify(
		{ _id: roomData._id },
		{
			update: {
				$pull: {
					voters: {
						id: voterId,
					},
				},
			},
			new: true,
		},
	);

	if (!updatedRoomData) return;

	sendRoomData(updatedRoomData);

	const kickedVoterSocket = sockets.get(voterId);
	if (kickedVoterSocket && kickedVoterSocket.readyState === WebSocket.OPEN) {
		const kickedEvent: KickedEvent = {
			event: "Kicked",
		};
		kickedVoterSocket.send(JSON.stringify(kickedEvent));
	}
};

/**
 * Middlewares
 */

const validateModerator: EventFunction<WebScoketMessageEvent> = (
	roomData,
	{ userId },
) => {
	if (!roomData.moderator || roomData.moderator.id !== userId) {
		return {
			message:
				"This command can only be executed by a moderator which you are not.",
		};
	}
};

const eventHandlerMap = new Map<
	WebScoketMessageEvent["event"],
	Array<EventFunction<any>>
>([
	["Join", [handleJoin]],
	["StartVoting", [validateModerator, handleStartVoting]],
	["StopVoting", [validateModerator, handleStopVoting]],
	["OptionSelected", [handleOptionSelected]],
	["ModeratorChange", [validateModerator, handleModeratorChange]],
	["KickVoter", [validateModerator, handleKickVoter]],
]);

export const handleWs = (socket: WebSocket, userId: string) => {
	const userAlreadyExists = sockets.has(userId);
	sockets.set(userId, socket);
	let roomCode: string | null = null;

	socket.addEventListener("open", () => {
		const connectEvent: ConnectEvent = {
			event: "Connected",
			userId,
		};
		socket.send(JSON.stringify(connectEvent));
	});

	socket.addEventListener("close", () => {
		const preSocket = sockets.get(userId);
		setTimeout(async () => {
			const postSocket = sockets.get(userId);

			// same userId but different socket object means they reconnected
			if (preSocket !== postSocket) {
				return;
			}

			// remove voter from room
			sockets.delete(userId);

			if (roomCode) {
				const roomData = await rooms.findOne({ roomCode });
				if (!roomData) return;

				await handleLeave(roomData, userId);
			}
			// socket is left alive for 3 seconds to allow user to rejoin
		}, 3000);
	});

	socket.addEventListener(
		"message",
		async (event: MessageEvent<string>): Promise<void> => {
			const data = JSON.parse(event.data) as WebScoketMessageEvent;

			if (data.event === "Join") {
				roomCode = data.roomCode;
			}

			if (!roomCode) return;

			const roomData = await rooms.findOne({ roomCode });
			if (!roomData) return;

			const eventFns = eventHandlerMap.get(data.event);
			if (!eventFns) return;

			try {
				for (const eventFn of eventFns) {
					const stop = await eventFn(
						roomData,
						{ userId, userAlreadyExists },
						data,
					);
					if (stop) {
						console.info(stop.message);
						break;
					}
				}
			} catch (err) {
				if (err instanceof Error) {
					console.error(err.message);
				}
			}
		},
	);
};
