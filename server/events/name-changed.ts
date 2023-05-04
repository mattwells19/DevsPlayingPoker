import rooms from "../models/rooms.ts";
import type { ChangeNameEvent } from "../types/socket.ts";
import type { EventFunction } from "./types.ts";
import utils from "./utils/mod.ts";

const handleNameChanged: EventFunction<ChangeNameEvent> = async (
	roomData,
	{ userId },
	data,
) => {
	if (!data.value || data.value.length === 0) {
		return {
			message: `Invalid name. Expected a name with length between 1 and 20, but got: '${data.value}'.`,
		};
	}

	const allNamesInRoom = [roomData.moderator!, ...roomData.voters]
		.filter((v) => v.id !== userId)
		.map((v) => v.name);
	const cleansedName = utils.cleanseName(data.value, allNamesInRoom);

	const updatedRoomData = await (() => {
		if (roomData.moderator?.id === userId) {
			return rooms.updateById(roomData._id, {
				$set: {
					moderator: {
						...roomData.moderator,
						name: cleansedName,
					},
				},
			});
		} else {
			const updatedVoters = roomData.voters.map((voter) => {
				if (voter.id === userId) {
					return {
						...voter,
						name: cleansedName,
					};
				}
				return voter;
			});

			return rooms.updateById(roomData._id, {
				$set: {
					voters: updatedVoters,
				},
			});
		}
	})();

	if (!updatedRoomData) return;

	utils.sendRoomData(updatedRoomData);
};

export default handleNameChanged;
