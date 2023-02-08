import { ObjectId, UpdateFilter } from "mongo";
import type { RoomSchema } from "../types/schemas.ts";
import db from "../utils/db.ts";

export const findByRoomCode = (roomCode: string) => {
	return db.rooms.findOne({ roomCode });
};

export const findById = (id: ObjectId) => {
	return db.rooms.findOne({ _id: id });
};

export const updateById = (id: ObjectId, updates: UpdateFilter<RoomSchema>) => {
	return db.rooms.findAndModify(
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

export const deleteById = (id: ObjectId) => {
	return db.rooms.deleteOne({ _id: id });
};
