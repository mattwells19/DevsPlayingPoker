import { RoomSchema } from './models/room.model.ts';
import { UserSchema } from './models/user.model.ts';
import { MongoClient, Collection } from './deps.ts';
import { config } from './deps.ts';
config({ path: './.env' });

const connectToDb = async () => {
  const DB_URL = Deno.env.get('DB_URL');
  if (!DB_URL) throw new Error('Problem importing from .env');
  const client = new MongoClient();
  await client.connect(DB_URL);
  const db = client.database('devs_playing_poker');

  const rooms = db.collection<RoomSchema>('rooms');
  const users = db.collection<UserSchema>('users');

  return { rooms, users, client };
};

const { rooms, users, client } = await connectToDb();

const seedDB = async (rooms: Collection<RoomSchema>, users: Collection<UserSchema>) => {
  console.log('Deleting all rooms');
  await rooms.deleteMany({ roomCode: { $ne: '' } });

  console.log('Deleting all users');
  await users.deleteMany({ name: { $ne: '' } });
};

await seedDB(rooms, users);
client.close();

export default seedDB;
