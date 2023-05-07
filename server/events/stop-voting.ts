import rooms from "../models/rooms.ts";
import type { StopVotingEvent } from "../types/socket.ts";
import type { EventFunction } from "./types.ts";
import utils from "./utils/mod.ts";

/**
 * Ends voting, transitioning to "Results" state
 */
const handleStopVoting: EventFunction<StopVotingEvent> = async (roomData) => {
	const updatedRoomData = await rooms.updateById(roomData._id, {
		$set: {
			state: "Results",
		},
	});

	utils.sendRoomData(updatedRoomData);
};

export default handleStopVoting;
