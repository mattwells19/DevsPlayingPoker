import { z as zod } from "zod";
import * as rooms from "../models/rooms.ts";
import { sendRoomData } from "./utils/mod.ts";
import type { EventFunction, VotingDescriptionEvent } from "../types/socket.ts";

// taken from EditDescription.tsx
const votingDescSchema = zod
	.string()
	.trim()
	.max(1000)
	.refine((val) => val.split("\n").length - 1 < 10);

const handleVotingDescriptionUpdated: EventFunction<
	VotingDescriptionEvent
> = async (roomData, _, { value }) => {
	// will throw if parsing fails
	votingDescSchema.parse(value);

	const updatedRoomData = await rooms.updateById(roomData._id, {
		$set: {
			votingDescription: value,
		},
	});

	if (!updatedRoomData) return;

	sendRoomData(updatedRoomData);
};

export default handleVotingDescriptionUpdated;
