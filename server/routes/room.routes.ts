import { Router } from "../deps.ts";
import {
	createRoom,
	getRoom,
	checkRoomExists,
	joinRoom,
} from "../controllers/room.controller.ts";

const router = Router();

router.post("/create", createRoom);
router.get("/rooms/:roomCode", getRoom);
router.get("/rooms/:roomCode/checkRoomExists", checkRoomExists);
router.post("/rooms/:roomCode/join", joinRoom);

export default router;
