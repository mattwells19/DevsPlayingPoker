import type { OpineRequest, OpineResponse } from "opine";
import type { RoomSchema } from "../types/schemas.ts";
import * as rooms from "../models/rooms.ts";

type OpineController<ResBody = unknown> = (
	req: OpineRequest,
	res: OpineResponse,
) => Promise<OpineResponse<ResBody>>;

const generateRoomCode = async (): Promise<string> => {
	let roomCode = getRandomCode();

	for (let i = 0; i < 5; i++) {
		const duplicateCode = await rooms.findByRoomCode(roomCode);

		if (!duplicateCode) return roomCode;

		console.debug(
			`Duplicate room code found, generating again. Retried ${i + 1} times.`,
		);
		roomCode = getRandomCode();
	}

	throw new Error("Unable to generate unique room code");
};

const getRandomCode = () => {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	for (let i = 0; i < 4; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

export interface CreateRoomRequest {
	moderatorName: string;
	options: RoomSchema["options"];
}

export const createRoom: OpineController = async (req, res) => {
	const { options }: CreateRoomRequest = req.body;

	try {
		const roomCode = await generateRoomCode();
		const room = await rooms.insertRoom({
			roomCode,
			moderator: null,
			state: "Results",
			options,
			votingDescription: "",
			voters: [],
			votingStartedAt: null,
			lastUpdated: new Date(),
		});
		console.debug(
			`Created room with _id of ${room} and roomCode of ${roomCode}`,
		);

		return res.setStatus(201).json({
			success: true,
			roomCode: roomCode,
		});
	} catch (err) {
		console.error(`Error creating room: ${err}`);
		return res.setStatus(500).json({
			success: false,
			message: err.message,
		});
	}
};

export const checkRoomExists: OpineController = async (req, res) => {
	const room = await rooms.findByRoomCode(req.params.roomCode);
	if (room) {
		return res.setStatus(200).json({
			success: true,
			message: `Room with roomCode of ${req.params.roomCode} exists.`,
		});
	}
	return res.setStatus(204).json({
		success: true,
		message: `Room with roomCode of ${req.params.roomCode} does not exist.`,
	});
};
