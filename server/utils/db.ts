import { ObjectId } from '../deps.ts';
import connectToDb from './connectToDb.ts';

export const { rooms, users } = await connectToDb();

export const lookupRoom = async (roomCode: string) => {
  if (!roomCode) throw new Error(`lookupRoom requires a roomCode, but was passed ${roomCode}`);
  return await rooms.findOne({ roomCode });
};

export const insertRoom = async (roomCode: string, moderatorId: ObjectId, options: number[]) => {
  return await rooms.insertOne({
    roomCode,
    moderatorId,
    options,
  });
};

export const insertUser = async (moderatorName: string) => {
  return await users.insertOne({
    name: moderatorName,
  });
};
