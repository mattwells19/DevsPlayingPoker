import { RoomSchema } from '../types/schemas.ts';
import { Collection } from '../deps.ts';

const generateRoomCode = async (rooms: Collection<RoomSchema>): Promise<string> => {
  let currentRetries = 0;
  const maxRetries = 5;
  let duplicateCode;
  let roomCode: string | Promise<string> = getRandomCode();

  for (let i = currentRetries; i < maxRetries; i++) {
    duplicateCode = await rooms.findOne({ roomCode });
    if (!duplicateCode) return roomCode;
    console.debug(`Duplicate room code found, generating again. Retried ${i + 1} times.`);
    roomCode = getRandomCode();
  }
  throw new Error('Unable to generate unique room code');
};

const getRandomCode = () => {
  let text = '';
  const possible = 'AB';
  for (let i = 0; i < 4; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export default generateRoomCode;
