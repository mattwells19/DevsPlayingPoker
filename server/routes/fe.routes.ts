import { Router } from "../deps.ts";
import { OpineRequest, OpineResponse } from "../deps.ts";
const router = Router();

router.get(
	[
		"/",
		"/create-room",
		"/join/:roomCode",
		"/room/:roomCode",
		"/assets/*",
		"/icons/*",
		"/manifest.json",
	],
	async (req: OpineRequest, res: OpineResponse) => {
		const relativePath = (() => {
			if (req.url.includes("/assets/") || req.url.includes("/icons/")) {
				return `./www${req.url}`;
			} else if (req.url.includes("site.webmanifest")) {
				return "./www/site.webmanifest";
			} else {
				return "./www/index.html";
			}
		})();

		const path = await Deno.realPath(relativePath);
		return res.sendFile(path);
	},
);

export default router;
