import { lookupRoom } from './db.ts';

const generateRoomCode = async (): Promise<string> => {
  const maxRetries = 5;
  let duplicateCode;
  let roomCode: string | Promise<string> = getRandomCode();

  for (let i = 0; i < maxRetries; i++) {
    duplicateCode = await lookupRoom(roomCode);
    if (!duplicateCode) return roomCode;
    console.debug(`Duplicate room code found, generating again. Retried ${i + 1} times.`);
    roomCode = getRandomCode();
  }
  throw new Error('Unable to generate unique room code');
};

const getRandomCode = () => {
  let text = '';
  // const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const possible = 'AB'; // Reduced roomCode options for testing
  for (let i = 0; i < 4; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export default generateRoomCode;
