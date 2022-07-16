import { UserSchema } from '../models/user.model.ts';
import { RoomSchema } from '../models/room.model.ts';
import { MongoClient, ObjectId, config } from '../deps.ts';
config({ path: './.env' });

const connectToDb = async () => {
  const DB_URL = Deno.env.get('DB_URL');
  if (!DB_URL) throw new Error('Problem importing from .env');
  const client = new MongoClient();
  await client.connect(DB_URL);
  const db = client.database('devs_playing_poker');

  const rooms = db.collection<RoomSchema>('rooms');
  const users = db.collection<UserSchema>('users');

  return { rooms, users };
};

export const { rooms, users } = await connectToDb();

export const lookupRoom = async (roomCode: string) => {
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
