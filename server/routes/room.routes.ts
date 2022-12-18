import { Router } from "../deps.ts";
import {
	createRoom,
	getRoom,
	checkRoomExists,
} from "../controllers/room.controller.ts";
import {
	validateNewRoom,
	validateRoomCode,
} from "../middlewares/validators.ts";

const router = Router();

router.post("/create", validateNewRoom, createRoom);
router.get("/rooms/:roomCode", validateRoomCode, getRoom);
router.get(
	"/rooms/:roomCode/checkRoomExists",
	validateRoomCode,
	checkRoomExists,
);

export default router;
