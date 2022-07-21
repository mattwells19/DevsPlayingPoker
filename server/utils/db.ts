import { ObjectId } from "../deps.ts";
import connectToDb from "./connectToDb.ts";

export const { rooms, users } = await connectToDb();

export const lookupRoom = async (roomCode: string) => {
	if (!roomCode)
		throw new Error(
			`lookupRoom requires a roomCode, but was passed ${roomCode}`,
		);
	return await rooms.findOne({ roomCode });
};

export const insertRoom = async (
	roomCode: string,
	moderatorId: ObjectId,
	options: number[],
) => {
	return await rooms.insertOne({
		roomCode,
		moderatorId,
		options,
		voters: [],
	});
};

export const updateRoom = async (
	roomCode: string,
	moderatorId: ObjectId,
	options: number[],
	voters: ObjectId[],
) => {
	return await rooms.updateOne(
		{ roomCode: { $eq: roomCode } },
		{
			$set: {
				moderatorId,
				options,
				voters,
			},
		},
	);
};

export const addVoterToRoom = async (roomCode: string, voter: ObjectId) => {
	const resp = await rooms.updateOne(
		{ roomCode: { $eq: roomCode } },
		{ $push: { voters: voter } },
	);
	if (resp.matchedCount < 1) {
		throw new Error(`Room with code ${roomCode} does not exist`);
	}
	return resp;
};

export const insertUser = async (moderatorName: string) => {
	return await users.insertOne({
		name: moderatorName,
	});
};
