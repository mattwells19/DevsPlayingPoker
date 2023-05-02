import * as rooms from "../models/rooms.ts";
import type { EventFunction, OptionSelectedEvent } from "../types/socket.ts";
import { ConfidenceValue } from "../types/schemas.ts";
import { sendRoomData } from "./utils/mod.ts";

export const calculateConfidence = (
	timeStarted: Date | null,
): ConfidenceValue => {
	if (!timeStarted) {
		throw new Error(
			`Unable to calculate voting confidence.  No timeStarted found.`,
		);
	}
	const currentTime = new Date();
	const millisecondsElapsed = currentTime.getTime() - timeStarted.getTime();
	const secondsElapsed = millisecondsElapsed / 1000;

	if (secondsElapsed < 5) {
		return ConfidenceValue.high;
	}
	if (secondsElapsed < 15) {
		return ConfidenceValue.medium;
	}
	return ConfidenceValue.low;
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

export default handleOptionSelected;
