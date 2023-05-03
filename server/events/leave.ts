import rooms from "../models/rooms.ts";
import type { RoomSchema } from "../types/schemas.ts";
import { sendRoomData } from "./utils/mod.ts";

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

export default handleLeave;
