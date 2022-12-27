import { OpineRequest, OpineResponse } from "../deps.ts";
import connectToDb from "../utils/db.ts";
import generateRoomCode from "../utils/generateRoomCode.ts";

type OpineController<ResBody = any> = (
	req: OpineRequest,
	res: OpineResponse,
) => Promise<OpineResponse<ResBody>>;

const { rooms } = await connectToDb();

export interface CreateRoomRequest {
	moderatorName: string;
	options: number[];
}

export const createRoom: OpineController = async (req, res) => {
	const { options }: CreateRoomRequest = req.body;

	try {
		const roomCode = await generateRoomCode();
		const room = await rooms.insertOne({
			roomCode,
			moderator: null,
			state: "Results",
			options,
			voters: [],
			votingStartedAt: null,
			lastUpdated: new Date(),
		});
		console.debug(
			`Room created with _id of ${room} and roomCode of ${roomCode}`,
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

export const getRoom: OpineController = async (req, res) => {
	const room = await rooms.findOne({ roomCode: req.params.roomCode });
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

export const checkRoomExists: OpineController = async (req, res) => {
	const room = await rooms.findOne({ roomCode: req.params.roomCode });
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
