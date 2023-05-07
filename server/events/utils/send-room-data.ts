import type { RoomSchema } from "../../types/schemas.ts";
import type { RoomUpdateEvent } from "../../types/socket.ts";
import sockets from "../../models/sockets.ts";

/**
 * Sends updated roomData to all voters and moderator in room
 * @param roomData
 * @returns void
 */
const sendRoomData = (roomData: RoomSchema | undefined): void => {
	if (!roomData) {
		console.debug("Failed to send updatedRoomData. No roomData found.");
		return;
	}

	const roomUpdateEvent: RoomUpdateEvent = {
		event: "RoomUpdate",
		roomData,
	};

	if (roomData.moderator) {
		const moderatorSock = sockets.get(roomData.moderator.id, roomData.roomCode);
		moderatorSock?.send(roomUpdateEvent);
	}

	for (const voter of roomData.voters) {
		const voterSock = sockets.get(voter.id, roomData.roomCode);
		voterSock?.send(roomUpdateEvent);
	}
};

export default sendRoomData;
