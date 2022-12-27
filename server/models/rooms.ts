import { ObjectId, UpdateFilter } from "../deps.ts";
import type { RoomSchema } from "../types/schemas.ts";
import connectToDb from "../utils/db.ts";

const { rooms } = await connectToDb();

export const findByRoomCode = (
	roomCode: string,
): ReturnType<typeof rooms.findOne> => {
	return rooms.findOne({ roomCode });
};

export const findById = (id: ObjectId): ReturnType<typeof rooms.findOne> => {
	return rooms.findOne({ _id: id });
};

export const updateById = (
	id: ObjectId,
	updates: UpdateFilter<RoomSchema>,
): ReturnType<typeof rooms.findAndModify> => {
	return rooms.findAndModify(
		{ _id: id },
		{
			update: {
				...updates,
				$set: {
					...updates.$set,
					lastUpdated: new Date(),
				},
			},
			new: true,
		},
	);
};

export const deleteById = (
	id: ObjectId,
): ReturnType<typeof rooms.deleteOne> => {
	return rooms.deleteOne({ _id: id });
};
