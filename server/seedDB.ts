import { Collection } from './deps.ts';
import { UserSchema } from './models/user.model.ts';
import { RoomSchema } from './models/room.model.ts';
import connectToDb from './utils/connectToDb.ts';

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
