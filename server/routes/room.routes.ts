import { Router } from "../deps.ts";
import { createRoom, checkRoomExists } from "../controllers/room.controller.ts";
import {
	validateNewRoom,
	validateRoomCode,
} from "../middlewares/validators.ts";
import rateLimiter from "../middlewares/rateLimiter.ts";

const router = Router();

router.post("/create", rateLimiter, validateNewRoom, createRoom);
router.get(
	"/rooms/:roomCode/checkRoomExists",
	rateLimiter,
	validateRoomCode,
	checkRoomExists,
);

export default router;
