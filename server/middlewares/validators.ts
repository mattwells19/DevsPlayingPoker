import { NextFunction, OpineRequest, OpineResponse } from "../deps.ts";

export function validateRoomCode(
	req: OpineRequest,
	res: OpineResponse,
	next: NextFunction,
) {
	const roomCode = req.params.roomCode;
	if (!roomCode) {
		return res.setStatus(400).json({
			success: false,
			message: "'roomCode' is required.",
		});
	}
	next();
}

export function validateNewRoom(
	req: OpineRequest,
	res: OpineResponse,
	next: NextFunction,
) {
	const body = req.body;

	if (
		"options" in body &&
		body.options instanceof Array &&
		body.options.length > 1
	) {
		return next();
	}

	return res.setStatus(400).json({
		success: false,
		message:
			"'options' is required and must be an array with more than option.",
	});
}
