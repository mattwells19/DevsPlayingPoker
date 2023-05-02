import { Router } from "opine";
import { validateOrigin } from "../middlewares/validators.ts";
import sockets from "../models/sockets.ts";

const router = Router();

router.get("/:roomCode", validateOrigin, (req, res, next) => {
	if (req.headers.get("upgrade") === "websocket") {
		const sock = req.upgrade();
		sockets.add(sock, req.params.roomCode, req.query.userId);
	} else {
		return res.send("You've gotta set the magic header...");
	}

	next();
});

export default router;
