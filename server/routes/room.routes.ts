import { Router } from "../deps.ts";
import {
	createRoom,
	getRoom,
	checkRoomExists,
} from "../controllers/room.controller.ts";

const router = Router();

router.post("/create", createRoom);
router.get("/rooms/:roomCode", getRoom);
router.get("/rooms/:roomCode/checkRoomExists", checkRoomExists);

export default router;
