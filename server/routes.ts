import { Router } from "opine";
import {
	validateNewRoom,
	validateOrigin,
	validateRoomCode,
} from "./middlewares/validators.ts";
import rateLimiter from "./middlewares/rateLimiter.ts";
import { checkRoomExists, createRoom } from "./controllers/room.controller.ts";
import { upgradeWSConnection } from "./controllers/socket.controller.ts";

// prefix: /
export const FeRoutes = Router();
// the FE handles the page not found logic
FeRoutes.get("*", async (_, res) => {
	const path = await Deno.realPath("./www/index.html");
	return res.sendFile(path);
});

// prefix: /api/v1
export const RoomRoutes = Router();
RoomRoutes.post("/create", rateLimiter, validateNewRoom, createRoom);
RoomRoutes.get(
	"/rooms/:roomCode/exists",
	rateLimiter,
	validateRoomCode,
	checkRoomExists,
);

// prefix: /ws
export const SocketRoutes = Router();
SocketRoutes.get("/:roomCode", validateOrigin, upgradeWSConnection);
