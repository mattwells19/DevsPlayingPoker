import { OpineRequest, OpineResponse } from "../deps.ts";
import { CreateRoomRequest, JoinRoomRequest } from "../types/requests.ts";
import addUser from "../utils/addUser.ts";
import checkIfRoomExists from "../utils/checkIfRoomExists.ts";
import {
	addVoterToRoom,
	insertRoom,
	insertUser,
	lookupRoom,
} from "../utils/db.ts";
import generateRoomCode from "../utils/generateRoomCode.ts";

export const createRoom = async (req: OpineRequest, res: OpineResponse) => {
	const { moderatorName, options }: CreateRoomRequest = req.body;

	try {
		const moderatorId = await insertUser(moderatorName);
		const roomCode = await generateRoomCode();
		const room = await insertRoom(roomCode, moderatorId, options);
		console.debug(
			`Room created with _id of ${room} and roomCode of ${roomCode}`,
		);

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

export const getRoom = async (req: OpineRequest, res: OpineResponse) => {
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

export const checkRoomExists = async (
	req: OpineRequest,
	res: OpineResponse,
) => {
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

export const joinRoom = async (req: OpineRequest, res: OpineResponse) => {
	const { name }: JoinRoomRequest = req.body;
	const { roomCode } = req.params;

	try {
		const userId = await addUser(name);

		await addVoterToRoom(roomCode, userId);
		console.debug(
			`Updated room: ${roomCode} to add voter with userId: ${userId}`,
		);
		res.setStatus(200).json({
			success: true,
			roomCode,
			userId,
		});
	} catch (err) {
		console.error(`Error joining room: ${err}`);
		res.setStatus(500).json({
			success: false,
			message: err.message,
		});
	}
};
