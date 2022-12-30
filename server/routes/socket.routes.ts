import { getCookies, Router } from "../deps.ts";
import { handleWs } from "../controllers/socket.controller.ts";

const router = Router();

router.get("/:roomCode", async (req, res, next) => {
	if (req.headers.get("upgrade") === "websocket") {
		const sock = req.upgrade();
		const sessionId = getCookies(req.headers)["session"];
		const roomCode = req.params.roomCode;

		await handleWs(sock, sessionId, roomCode);
	} else {
		return res.send("You've gotta set the magic header...");
	}

	next();
});

export default router;
