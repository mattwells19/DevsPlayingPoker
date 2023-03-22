import { Router } from "opine";
import { handleWs } from "../controllers/socket.controller.ts";
import { validateWSOrigin } from "../middlewares/validators.ts";

const router = Router();

router.get("/:roomCode", validateWSOrigin, async (req, res, next) => {
	if (req.headers.get("upgrade") === "websocket") {
		const sock = req.upgrade();
		const userId = req.query.userId ?? crypto.randomUUID();
		const roomCode = req.params.roomCode;

		await handleWs(sock, userId, roomCode);
	} else {
		return res.send("You've gotta set the magic header...");
	}

	next();
});

export default router;
