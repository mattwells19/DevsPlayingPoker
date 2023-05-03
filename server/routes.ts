import { Router } from "opine";
import {
	validateNewRoom,
	validateOrigin,
	validateRoomCode,
} from "./middlewares/validators.ts";
import rateLimiter from "./middlewares/rateLimiter.ts";
import { checkRoomExists, createRoom } from "./controllers/room.controller.ts";
import { upgradeWSConnection } from "./controllers/socket.controller.ts";

export const FeRoutes = Router();
FeRoutes.get(
	[
		"/",
		"/create-room",
		"/join/:roomCode",
		"/room/:roomCode",
		"/voting-moderator",
	],
	async (_, res) => {
		const path = await Deno.realPath("./www/index.html");
		return res.sendFile(path);
	},
);

export const RoomRoutes = Router();
RoomRoutes.post("/create", rateLimiter, validateNewRoom, createRoom);
RoomRoutes.get(
	"/rooms/:roomCode/checkRoomExists",
	rateLimiter,
	validateRoomCode,
	checkRoomExists,
);

export const SocketRoutes = Router();
SocketRoutes.get("/:roomCode", validateOrigin, upgradeWSConnection);
