import { Router } from "../deps.ts";

const router = Router();

router.get(
	["/", "/create-room", "/join/:roomCode", "/room/:roomCode"],
	async (_, res) => {
		const path = await Deno.realPath("./www/index.html");
		return res.sendFile(path);
	},
);

export default router;
