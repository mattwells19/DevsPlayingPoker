import { Router } from "../deps.ts";
import { OpineRequest, OpineResponse } from "../deps.ts";
const router = Router();

router.get(
	["/", "/create-room", "/join/:roomCode", "/room/:roomCode", "/assets/*"],
	async (req: OpineRequest, res: OpineResponse) => {
		const path = await Deno.realPath(
			req.url.includes("/assets/") ? `./www${req.url}` : "./www/index.html",
		);
		return res.sendFile(path);
	},
);

export default router;
