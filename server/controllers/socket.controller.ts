import type { NextFunction, OpineRequest, OpineResponse } from "../deps.ts";
import type { RoomSchema } from "../models/room.model.ts";
import {
	JoinEvent,
	WebSocketEvent,
	RoomUpdateEvent,
	ConnectEvent,
} from "../types/socket.ts";
import connectToDb from "../utils/connectToDb.ts";
import { lookupRoom } from "../utils/db.ts";

const sockets = new Map<string, WebSocket>();
export const { rooms, users } = await connectToDb();

/**
 * Adds a player to the room specified either as a moderator or voter.
 * @param userId ID of the user joining
 * @param data JoinEvent data
 * @returns Whether the person who joined is the moderator of the room
 */
async function handleJoin(userId: string, data: JoinEvent): Promise<boolean> {
	const roomData = await lookupRoom(data.roomCode);
	if (!roomData) {
		throw new Error(`No room with room code ${data.roomCode}.`);
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

	if (!updatedRoomData) {
		throw new Error(`Updating room failed for room code ${data.roomCode}.`);
	}

	if (updatedRoomData.moderator) {
		const moderatorSock = sockets.get(updatedRoomData?.moderator?.id);
		const roomUpdate: RoomUpdateEvent = {
			event: "RoomUpdate",
			roomData: updatedRoomData,
		};
		moderatorSock?.send(JSON.stringify(roomUpdate));
	}

	updatedRoomData?.voters.forEach(({ id: voterId }) => {
		const voterSock = sockets.get(voterId);
		const roomUpdate: RoomUpdateEvent = {
			event: "RoomUpdate",
			roomData: updatedRoomData,
		};
		voterSock?.send(JSON.stringify(roomUpdate));
	});

	return isModerator;
}

/**
 * Removes the user from the room and performs moderator migration if necessary
 * @param userId ID of the user leaving
 * @param roomCode 4-character code for the room
 * @returns void
 */
async function handleLeave(userId: string, roomCode: string): Promise<void> {
	let updatedRoomData: RoomSchema | undefined;

	const roomData = await lookupRoom(roomCode);
	if (!roomData) return;

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

	if (!updatedRoomData) return;

	if (updatedRoomData.moderator) {
		const moderatorSock = sockets.get(updatedRoomData.moderator.id);
		const roomUpdate: RoomUpdateEvent = {
			event: "RoomUpdate",
			roomData: updatedRoomData,
		};
		moderatorSock?.send(JSON.stringify(roomUpdate));
	}

	for (const voter of updatedRoomData.voters) {
		const voterSock = sockets.get(voter.id.toString());
		const roomUpdate: RoomUpdateEvent = {
			event: "RoomUpdate",
			roomData: updatedRoomData,
		};
		voterSock?.send(JSON.stringify(roomUpdate));
	}
}

/**
 * Begins voting, clearing previous votes
 * @param roomCode 4-character code for the room
 * @returns void
 */
async function handleStartVoting(roomCode: string | null): Promise<void> {
	if (!roomCode) throw new Error("Unable to start voting due to no room code.");

	const roomData = await lookupRoom(roomCode);
	if (!roomData) return;

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
		},
	);

	if (!updatedRoomData) return;

	if (updatedRoomData.moderator) {
		const moderatorSock = sockets.get(updatedRoomData.moderator.id);
		const roomUpdate: RoomUpdateEvent = {
			event: "RoomUpdate",
			roomData: updatedRoomData,
		};
		moderatorSock?.send(JSON.stringify(roomUpdate));
	}

	for (const voter of updatedRoomData.voters) {
		const voterSock = sockets.get(voter.id.toString());
		const roomUpdate: RoomUpdateEvent = {
			event: "RoomUpdate",
			roomData: updatedRoomData,
		};
		voterSock?.send(JSON.stringify(roomUpdate));
	}
}

// TODO: how to handle thrown errors?
export const handleWs = (socket: WebSocket) => {
	const userId: string = crypto.randomUUID();
	sockets.set(userId, socket);
	let roomCode: string | null = null;

	socket.addEventListener("open", () => {
		const connectEvent: ConnectEvent = {
			event: "Connected",
			userId,
		};
		socket.send(JSON.stringify(connectEvent));
	});

	// TODO: how to handle refreshes?
	socket.addEventListener("close", async () => {
		// remove voter from room
		sockets.delete(userId);

		if (roomCode) {
			await handleLeave(userId, roomCode);
		}
	});

	socket.addEventListener(
		"message",
		async (event: MessageEvent<string>): Promise<void> => {
			const data = JSON.parse(event.data) as WebSocketEvent;

			switch (data.event) {
				case "Join": {
					roomCode = data.roomCode;
					await handleJoin(userId, data);
					break;
				}
				case "StartVoting": {
					await handleStartVoting(roomCode);
					break;
				}
			}
		},
	);
};

export async function establishSocketConnection(
	req: OpineRequest,
	res: OpineResponse,
	next: NextFunction,
) {
	if (req.headers.get("upgrade") === "websocket") {
		const sock = req.upgrade();
		await handleWs(sock);
	} else {
		res.send("You've gotta set the magic header...");
	}

	next();
}
