import { Router } from "../deps.ts";
import { OpineRequest, OpineResponse, getCookies, createJWT } from "../deps.ts";
const JWT_SECRET = Deno.env.get("JWT_SECRET");
if (!JWT_SECRET) throw new Error("Error importing JWT_SECRET from .env");
const router = Router();

router.get(
	["/", "/create-room", "/join/:roomCode", "/room/:roomCode"],
	async (req: OpineRequest, res: OpineResponse) => {
		const cookies = getCookies(req.headers);
		if (!Object.hasOwn(cookies, "DPP_TOKEN")) {
			console.debug("No userId in cookie, creating new");
			const userId = crypto.randomUUID();
			const jwt = await createJWT(
				{ alg: "HS512", type: "JWT" },
				{ userId },
				JWT_SECRET,
			);
			res.cookie({
				name: "DPP_TOKEN",
				value: jwt,
				path: "/",
			});
		} else {
			console.debug("DPP_TOKEN cookie found, not creating new.");
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
