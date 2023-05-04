import rooms from "../models/rooms.ts";
import sockets from "../models/sockets.ts";
import type { KickVoterEvent } from "../types/socket.ts";
import type { EventFunction } from "./types.ts";
import utils from "./utils/mod.ts";

const handleVoterKicked: EventFunction<KickVoterEvent> = async (
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

	utils.sendRoomData(updatedRoomData);

	const kickedVoterSocket = sockets.get(voterId, roomData.roomCode);
	kickedVoterSocket?.send({ event: "Kicked" });
};

export default handleVoterKicked;
