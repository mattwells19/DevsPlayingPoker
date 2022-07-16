import { request, response } from '../deps.ts';
import { CreateRoomRequest } from '../types/requests.ts';
import checkIfRoomExists from '../utils/checkIfRoomExists.ts';
import { insertRoom, insertUser, lookupRoom } from '../utils/db.ts';
import generateRoomCode from '../utils/generateRoomCode.ts';

export const createRoom = async (req: typeof request, res: typeof response) => {
  const { moderatorName, options }: CreateRoomRequest = req.body;
  const moderatorId = await insertUser(moderatorName);

  try {
    const roomCode = await generateRoomCode();
    const room = await insertRoom(roomCode, moderatorId, options);
    console.debug(`Room created with _id of ${room} and roomCode of ${roomCode}`);

    res.setStatus(201).json({
      success: true,
      roomCode: roomCode,
      userId: moderatorId,
    });
  } catch (err) {
    console.error(`Error creating room: ${err}`);
    res.setStatus(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getRoom = async (req: typeof request, res: typeof response) => {
  const room = await lookupRoom(req.params.roomCode);
  if (room) {
    return res.setStatus(200).json({
      success: true,
      room,
    });
  }
  return res.setStatus(404).json({
    success: false,
    message: `Room with roomCode of ${req.params.roomCode} not found`,
  });
};

export const checkRoomExists = async (req: typeof request, res: typeof response) => {
  if (await checkIfRoomExists(req.params.roomCode)) {
    return res.setStatus(200).json({
      success: true,
      message: `Room with roomCode of ${req.params.roomCode} exists.`,
    });
  }
  return res.setStatus(204).json({
    success: true,
    message: `Room with roomCode of ${req.params.roomCode} does not exists.`,
  });
};
