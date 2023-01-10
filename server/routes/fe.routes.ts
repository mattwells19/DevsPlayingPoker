import { Router } from "../deps.ts";

const router = Router();

router.get(
	["/", "/create-room", "/join/:roomCode", "/room/:roomCode"],
	async (_, res) => {
		const path = await Deno.realPath("./www/index.html");
		return res.sendFile(path);
	},
);

router.get("/assets/:fileName", async (req, res) => {
	const path = await Deno.realPath(`./www/assets/${req.params.fileName}`);
	return res.sendFile(path);
});

router.get("/icons/:fileName", async (req, res) => {
	const path = await Deno.realPath(`./www/icons/${req.params.fileName}`);
	return res.sendFile(path);
});

router.get("/translations/:fileName", async (req, res) => {
	const path = await Deno.realPath(`./www/translations/${req.params.fileName}`);
	return res.sendFile(path);
});

router.get("/site.webmanifest", async (_, res) => {
	const path = await Deno.realPath("./www/site.webmanifest");
	return res.sendFile(path);
});

export default router;
