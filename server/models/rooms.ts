import { ObjectId, UpdateFilter } from "mongo";
import type { RoomSchema } from "../types/schemas.ts";
import db from "../utils/db.ts";
import { SimpleCache } from "../utils/SimpleCache.ts";

const roomDataCache = new SimpleCache<RoomSchema>();

export const findByRoomCode = (roomCode: string) => {
	const cacheHit = roomDataCache.get(roomCode);
	return cacheHit ?? db.rooms.findOne({ roomCode });
};

export const updateById = async (
	id: ObjectId,
	updates: UpdateFilter<RoomSchema>,
): ReturnType<typeof db.rooms.findAndModify> => {
	const updatedData = await db.rooms.findAndModify(
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

	if (updatedData) {
		roomDataCache.set(updatedData.roomCode, updatedData);
	}

	return updatedData;
};

export const deleteByRoomCode = (roomCode: string) => {
	roomDataCache.delete(roomCode);
	return db.rooms.deleteOne({ roomCode });
};

export const insertRoom = async (
	roomData: Omit<RoomSchema, "_id">,
): ReturnType<typeof db.rooms.insertOne> => {
	const roomId = await db.rooms.insertOne(roomData);

	roomDataCache.set(roomData.roomCode, {
		_id: roomId,
		...roomData,
	});

	return roomId;
};
