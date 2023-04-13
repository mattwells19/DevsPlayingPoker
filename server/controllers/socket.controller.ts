import { z as zod } from "zod";
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
	VotingDescriptionEvent,
	ChangeNameEvent,
} from "../types/socket.ts";
import calculateConfidence from "../utils/calculateConfidence.ts";
import * as rooms from "../models/rooms.ts";

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
		roomData,
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
 * Prevents duplicate names and enforces max name length
 * @param origName The name to be cleansed
 * @param roomData The room data to check for duplicate names
 * @returns The cleansed name
 */
const cleanseName = (origName: string, roomData: RoomSchema) => {
	// max name length of 20 characters (not including potential name counter)
	const trimmedName = origName.trim().substring(0, 20);

	const allPeopleInRoom = [
		roomData.moderator?.name,
		...roomData.voters.map((voter) => voter.name),
	];

	const isNameAlreadyUsed = (nameToCheck: string) =>
		allPeopleInRoom.some(
			(personInRoom) =>
				personInRoom?.toLowerCase().localeCompare(nameToCheck.toLowerCase()) ===
				0,
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
	{ userId },
	data,
) => {
	// check if the user already exists in the room
	const userIdExists = (() => {
		if (roomData.moderator?.id === userId) return true;
		return roomData.voters.some((voter) => voter.id === userId);
	})();

	// if they're already in the room, no need to add them again just send an update
	if (userIdExists) {
		const socket = sockets.get(getSocketId(userId, roomData.roomCode));
		const roomUpdateEvent: RoomUpdateEvent = {
			event: "RoomUpdate",
			roomData,
		};

		socket?.send(JSON.stringify(roomUpdateEvent));
		return;
	}

	if (!data.name || data.name.length === 0) {
		return {
			message: `Invalid name. Expected a name with length between 1 and 20, but got: '${data.name}'.`,
		};
	}

	const cleansedName = cleanseName(data.name, roomData);

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
			await rooms.deleteByRoomCode(roomData.roomCode);
			console.debug(
				`Deleted room with _id of ${roomData._id} and roomCode of ${roomData.roomCode}`,
			);
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
	// remove the new moderator and the voting-moderator (if exists) from the voters
	const newVoters = roomData.voters.filter(
		(voter) =>
			voter.id !== data.newModeratorId &&
			voter.id !== `voter-${roomData.moderator!.id}`,
	);

	const newVoter: Voter = (() => {
		const baseVoter = {
			id: roomData.moderator!.id,
			name: roomData.moderator!.name,
			confidence: null,
			selection: null,
		};

		// if there's a voting moderator, transfer their selection to the new voter entity
		const votingModerator = roomData.voters.find(
			(voter) => voter.id === `voter-${roomData.moderator!.id}`,
		);

		if (
			votingModerator &&
			votingModerator.confidence &&
			votingModerator.selection
		) {
			return {
				...baseVoter,
				confidence: votingModerator.confidence,
				selection: votingModerator.selection,
			};
		}

		return baseVoter;
	})();

	const updatedVoters = [...newVoters, newVoter];

	const newModerator = roomData.voters.find(
		(voter) => voter.id === data.newModeratorId,
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

// taken from EditDescription.tsx
const votingDescSchema = zod
	.string()
	.trim()
	.max(1000)
	.refine((val) => val.split("\n").length - 1 < 10);

const handleVotingDescription: EventFunction<VotingDescriptionEvent> = async (
	roomData,
	_,
	{ value },
) => {
	// will throw if parsing fails
	votingDescSchema.parse(value);

	const updatedRoomData = await rooms.updateById(roomData._id, {
		$set: {
			votingDescription: value,
		},
	});

	if (!updatedRoomData) return;

	sendRoomData(updatedRoomData);
};

const handleChangeName: EventFunction<ChangeNameEvent> = async (
	roomData,
	{ userId },
	data,
) => {
	if (!data.value || data.value.length === 0) {
		return {
			message: `Invalid name. Expected a name with length between 1 and 20, but got: '${data.value}'.`,
		};
	}

	const cleansedName = cleanseName(data.value, roomData);

	const updatedRoomData = await (() => {
		if (roomData.moderator?.id === userId) {
			return rooms.updateById(roomData._id, {
				$set: {
					moderator: {
						...roomData.moderator,
						name: cleansedName,
					},
				},
			});
		} else {
			const updatedVoters = roomData.voters.map((voter) => {
				if (voter.id === userId) {
					return {
						...voter,
						name: cleansedName,
					};
				}
				return voter;
			});

			return rooms.updateById(roomData._id, {
				$set: {
					voters: updatedVoters,
				},
			});
		}
	})();

	if (!updatedRoomData) return;

	sendRoomData(updatedRoomData);
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

const validateInRoom: EventFunction<WebScoketMessageEvent> = (...params) => {
	const isModerator = !validateModerator(...params);
	if (isModerator) return;

	const isVoter = !validateVoter(...params);
	if (isVoter) return;

	return {
		message:
			"This command can only be executed by someone in the specified room which you are not.",
	};
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
	["UpdateVotingDescription", [validateModerator, handleVotingDescription]],
	["ChangeName", [validateInRoom, handleChangeName]],
]);

export const handleWs = (
	socket: WebSocket,
	userId: string,
	roomCode: string,
) => {
	const socketId = getSocketId(userId, roomCode);

	const prevUserSocket = sockets.get(socketId);
	const userAlreadyExists = !!prevUserSocket;
	if (prevUserSocket && prevUserSocket.readyState === WebSocket.OPEN) {
		prevUserSocket.close();
	}

	sockets.set(socketId, socket);

	socket.addEventListener("open", async () => {
		const roomExists = await rooms.findByRoomCode(roomCode);

		const connectEvent: ConnectEvent = {
			event: "Connected",
			userId,
			roomExists: !!roomExists,
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
			if (event.data === "PING") {
				return socket.send("PONG");
			}

			const data = JSON.parse(event.data) as WebScoketMessageEvent;

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
