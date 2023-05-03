import rooms from "../models/rooms.ts";
import type { StartVotingEvent } from "../types/socket.ts";
import type { EventFunction } from "./types.ts";
import { sendRoomData } from "./utils/mod.ts";

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

export default handleStartVoting;
