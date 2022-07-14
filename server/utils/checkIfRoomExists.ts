import { Collection } from '../deps.ts';
import { RoomSchema } from '../types/schemas.ts';

const checkIfRoomExists = async (roomCode: string, rooms: Collection<RoomSchema>) => {
  const room = await rooms.findOne({ roomCode });
  return !!room;
};

export default checkIfRoomExists;
