import { Collection } from '../deps.ts';
import { RoomSchema, UserSchema } from '../types/schemas.ts';

const seedDB = async (rooms: Collection<RoomSchema>, users: Collection<UserSchema>) => {
  console.log('Deleting all rooms');
  await rooms.deleteMany({ roomCode: { $ne: '' } });

  console.log('Deleting all users');
  await users.deleteMany({ name: { $ne: '' } });
};

export default seedDB;
