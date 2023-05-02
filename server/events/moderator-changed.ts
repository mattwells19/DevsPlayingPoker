import * as rooms from "../models/rooms.ts";
import { sendRoomData } from "./utils/mod.ts";
import type { Voter, User } from "../types/schemas.ts";
import type { EventFunction, ModeratorChangeEvent } from "../types/socket.ts";

/**
 * Updates moderator to existing voter.  Adds former moderator to list of voters.
 */
const handleModeratorChanged: EventFunction<ModeratorChangeEvent> = async (
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

export default handleModeratorChanged;
