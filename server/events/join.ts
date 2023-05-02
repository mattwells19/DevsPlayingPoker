import sockets from "../models/sockets.ts";
import * as rooms from "../models/rooms.ts";
import type { EventFunction, JoinEvent } from "../types/socket.ts";
import { cleanseName, sendRoomData } from "./utils/mod.ts";

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
		const socket = sockets.get(userId, roomData.roomCode);
		socket?.send({ event: "RoomUpdate", roomData });
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

export default handleJoin;
