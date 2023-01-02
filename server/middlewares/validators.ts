import { NextFunction, OpineRequest, OpineResponse, zod } from "../deps.ts";

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

const newRoomSchema = zod.object({
	options: zod
		.number()
		.array()
		.min(2, "Need at least 2 options.")
		// 15 from pattern + 1 no-vote option
		.max(15 + 1, "No more than 16 options is allowed.")
		.or(zod.tuple([zod.literal("Yes"), zod.literal("No")])),
});

export function validateNewRoom(
	req: OpineRequest,
	res: OpineResponse,
	next: NextFunction,
) {
	const result = newRoomSchema.safeParse(req.body);

	if (!result.success) {
		return res.setStatus(400).json({
			success: false,
			message: result.error.flatten().fieldErrors.options?.[0],
		});
	}

	next();
}
