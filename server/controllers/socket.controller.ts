import type { RoomSchema, User, Voter } from "../types/schemas.ts";
import type {
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
import { ObjectId } from "../deps.ts";
import * as rooms from "../models/rooms.ts";
import { delay } from "https://deno.land/std@0.137.0/async/delay.ts";

const sockets = new Map<string, WebSocket>();

const getSocketId = (userId: string, roomCode: string) =>
	`${userId}-${roomCode}`;

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
		const moderatorSock = sockets.get(
			getSocketId(roomData.moderator.id, roomData.roomCode),
		);

		if (moderatorSock && moderatorSock.readyState === WebSocket.OPEN) {
			moderatorSock.send(JSON.stringify(roomUpdateEvent));
		}
	}

	for (const voter of roomData.voters) {
		const voterSock = sockets.get(
			getSocketId(voter.id.toString(), roomData.roomCode),
		);

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

	if (!data.name || data.name.length === 0) {
		return {
			message: `Invalid name. Expected a name with length between 1 and 10, but got: '${data.name}'.`,
		};
	}

	const cleansedName = (() => {
		// max name length of 10 characters (not including potential name counter)
		const trimmedName = data.name.trim().substring(0, 10);

		const allPeopleInRoom = [
			roomData.moderator?.name,
			...roomData.voters.map((voter) => voter.name),
		];

		const isNameAlreadyUsed = (nameToCheck: string) =>
			allPeopleInRoom.some(
				(personInRoom) =>
					personInRoom
						?.toLowerCase()
						.localeCompare(nameToCheck.toLowerCase()) === 0,
			);

		let cnt = 1;
		let newUserName = trimmedName;
		while (isNameAlreadyUsed(newUserName)) {
			if (cnt === 10) {
				throw new Error("Too many duplicate names. Suspected bad behavior.");
			}

			newUserName = trimmedName + ` (${cnt})`;
			cnt++;
		}

		return newUserName;
	})();

	const isModerator = !roomData.moderator;

	const updatedRoomData = await rooms.updateById(
		roomData._id,
		!isModerator
			? {
					$push: {
						voters: {
							$each: [
								{
									id: userId,
									name: cleansedName,
									confidence: null,
									selection: null,
								},
							],
						},
					},
			  }
			: {
					$set: {
						moderator: { id: userId, name: cleansedName },
					},
			  },
	);

	sendRoomData(updatedRoomData);
};

/**
 * Removes the user from the room and performs moderator migration if necessary
 */
const handleLeave = async (
	roomData: RoomSchema,
	userId: string,
): Promise<void> => {
	let updatedRoomData: RoomSchema | undefined;

	if (roomData.moderator && roomData.moderator.id === userId) {
		if (roomData.voters.length > 0) {
			const newModerator = roomData.voters[0];

			updatedRoomData = await rooms.updateById(roomData._id, {
				$set: {
					moderator: { id: newModerator.id, name: newModerator.name },
				},
				$pull: { voters: { id: newModerator.id } },
			});
		} else {
			// if the moderator left and there's no one else in the room, delete the room
			await rooms.deleteById(roomData._id);
			return;
		}
	} else {
		updatedRoomData = await rooms.updateById(roomData._id, {
			$pull: { voters: { id: userId } },
		});
	}

	sendRoomData(updatedRoomData);
};

/**
 * Begins voting, clearing previous votes
 */
const handleStartVoting: EventFunction<StartVotingEvent> = async (roomData) => {
	const updatedVoters = roomData.voters.map((voter) => ({
		id: voter.id,
		name: voter.name,
		selection: null,
		confidence: null,
	}));

	const updatedRoomData = await rooms.updateById(roomData._id, {
		$set: {
			state: "Voting",
			voters: updatedVoters,
			votingStartedAt: new Date(),
		},
	});

	sendRoomData(updatedRoomData);
};

/**
 * Ends voting, transitioning to "Results" state
 */
const handleStopVoting: EventFunction<StopVotingEvent> = async (roomData) => {
	const updatedRoomData = await rooms.updateById(roomData._id, {
		$set: {
			state: "Results",
		},
	});

	sendRoomData(updatedRoomData);
};

/**
 * Updates voter selection and confidence.  Sends updated roomdata
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

	const updatedRoomData = await rooms.updateById(roomData._id, {
		$set: {
			voters: updatedVoters,
		},
	});

	sendRoomData(updatedRoomData);
};

/**
 * Updates moderator to existing voter.  Adds former moderator to list of voters.
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

	const updatedRoomData = await rooms.updateById(roomData._id, {
		$set: {
			voters: updatedVoters,
			moderator: updatedModerator,
		},
	});

	sendRoomData(updatedRoomData);
};

const handleKickVoter: EventFunction<KickVoterEvent> = async (
	roomData,
	_,
	{ voterId },
) => {
	const updatedRoomData = await rooms.updateById(roomData._id, {
		$pull: {
			voters: {
				id: voterId,
			},
		},
	});

	if (!updatedRoomData) return;

	sendRoomData(updatedRoomData);

	const kickedVoterSocket = sockets.get(
		getSocketId(voterId, roomData.roomCode),
	);
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

const validateVoter: EventFunction<WebScoketMessageEvent> = (
	roomData,
	{ userId },
) => {
	if (roomData.voters.every((voter) => voter.id !== userId)) {
		return {
			message:
				"This command can only be executed by a voter in the specified room which you are not.",
		};
	}
};

const updateSession = async (
	userId: string,
): ReturnType<typeof sessions.updateOne> => {
	const { sessions } = await connectToDb();

	return sessions.updateOne(
		{ _id: new ObjectId(userId) },
		{
			$set: {
				maxAge: new Date(Date.now() + constants.sessionTimeout),
			},
		},
	);
};

const eventHandlerMap = new Map<
	WebScoketMessageEvent["event"],
	Array<EventFunction<any>>
>([
	["Join", [handleJoin]],
	["StartVoting", [validateModerator, handleStartVoting]],
	["StopVoting", [validateModerator, handleStopVoting]],
	["OptionSelected", [validateVoter, handleOptionSelected]],
	["ModeratorChange", [validateModerator, handleModeratorChange]],
	["KickVoter", [validateModerator, handleKickVoter]],
]);

export const handleWs = (
	socket: WebSocket,
	userId: string,
	roomCode: string,
) => {
	const socketId = getSocketId(userId, roomCode);
	const userAlreadyExists = sockets.has(socketId);
	sockets.set(socketId, socket);

	socket.addEventListener("open", () => {
		const connectEvent: ConnectEvent = {
			event: "Connected",
			userId,
		};
		socket.send(JSON.stringify(connectEvent));
	});

	socket.addEventListener("close", () => {
		const preSocket = sockets.get(socketId);
		setTimeout(async () => {
			const postSocket = sockets.get(socketId);

			// same socketId but different socket object means they reconnected
			if (preSocket !== postSocket) {
				return;
			}

			// remove voter from room
			sockets.delete(socketId);

			const roomData = await rooms.findByRoomCode(roomCode);
			if (!roomData) return;

			await handleLeave(roomData, userId);
			// socket is left alive for 3 seconds to allow user to rejoin
		}, 3000);
	});

	socket.addEventListener(
		"message",
		async (event: MessageEvent<string>): Promise<void> => {
			const data = JSON.parse(event.data) as WebScoketMessageEvent;
			await updateSession(userId);

			const roomData = await rooms.findByRoomCode(roomCode);
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
