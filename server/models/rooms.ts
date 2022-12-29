import { ObjectId, UpdateFilter } from "../deps.ts";
import type { RoomSchema } from "../types/schemas.ts";
import connectToDb from "../utils/db.ts";

export const findByRoomCode = async (
	roomCode: string,
): ReturnType<typeof rooms.findOne> => {
	const { rooms } = await connectToDb();

	return rooms.findOne({ roomCode });
};

export const findById = async (
	id: ObjectId,
): ReturnType<typeof rooms.findOne> => {
	const { rooms } = await connectToDb();

	return rooms.findOne({ _id: id });
};

export const updateById = async (
	id: ObjectId,
	updates: UpdateFilter<RoomSchema>,
): ReturnType<typeof rooms.findAndModify> => {
	const { rooms } = await connectToDb();

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

export const deleteById = async (
	id: ObjectId,
): ReturnType<typeof rooms.deleteOne> => {
	const { rooms } = await connectToDb();

	return rooms.deleteOne({ _id: id });
};
