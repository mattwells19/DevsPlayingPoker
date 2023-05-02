import * as rooms from "../models/rooms.ts";
import type { EventFunction, StopVotingEvent } from "../types/socket.ts";
import { sendRoomData } from "./utils/mod.ts";

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

export default handleStopVoting;
