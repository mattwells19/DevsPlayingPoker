import { lookupRoom } from './db.ts';

const checkIfRoomExists = async (roomCode: string) => {
  const room = await lookupRoom(roomCode);
  return !!room;
};

export default checkIfRoomExists;
