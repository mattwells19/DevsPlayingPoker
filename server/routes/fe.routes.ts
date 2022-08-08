import { Router } from "../deps.ts";
import { OpineRequest, OpineResponse, getCookies } from "../deps.ts";
const router = Router();

router.get(
	["/", "/create-room", "/join/:roomCode", "/room/:roomCode"],
	async (req: OpineRequest, res: OpineResponse) => {
		const cookies = getCookies(req.headers);
		if (!Object.hasOwn(cookies, "DPP_USER_ID")) {
			console.debug("No userId in cookie, creating new");
			const userId = crypto.randomUUID();
			res.cookie({
				name: "DPP_USER_ID",
				value: userId,
				path: "/",
			});
		} else {
			console.debug(`Found userID in cookie: ${cookies["DPP_USER_ID"]}`);
		}
		const path = await Deno.realPath(
			req.url.includes("/assets/") ? `./www${req.url}` : "./www/index.html",
		);
		return res.sendFile(path);
	},
);

router.get("/assets/*", async (req: OpineRequest, res: OpineResponse) => {
	const path = await Deno.realPath(
		req.url.includes("/assets/") ? `./www${req.url}` : "./www/index.html",
	);
	return res.sendFile(path);
});

export default router;
