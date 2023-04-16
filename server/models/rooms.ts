import db from "../utils/db.ts";
import { SimpleCache } from "../utils/SimpleCache.ts";
import { Room, Prisma } from "prisma-types";

const roomDataCache = new SimpleCache<Room>();

export const findByRoomCode = async (
	roomCode: string,
): Promise<Room | null> => {
	const cacheHit = roomDataCache.get(roomCode);
	if (cacheHit) {
		return cacheHit;
	}

	const fetchedRoomData = await db.room.findUnique({ where: { roomCode } });
	if (fetchedRoomData) {
		roomDataCache.set(fetchedRoomData.roomCode, fetchedRoomData);
	}

	return fetchedRoomData;
};

export const updateById = async (
	id: string,
	updates: Prisma.RoomUpdateInput,
): Promise<Room> => {
	const updatedData = await db.room.update({
		where: { id: id.toString() },
		data: {
			...updates,
			lastUpdated: new Date(),
		},
	});

	if (updatedData) {
		roomDataCache.set(updatedData.roomCode, updatedData);
	}

	return updatedData;
};

export const deleteByRoomCode = (roomCode: string) => {
	roomDataCache.delete(roomCode);
	return db.room.delete({ where: { roomCode } });
};

export const insertRoom = async (
	roomData: Omit<Room, "id">,
): Promise<Room["id"]> => {
	const createdRoom = await db.room.create({
		data: roomData,
	});

	roomDataCache.set(roomData.roomCode, createdRoom);

	return createdRoom.id;
};
