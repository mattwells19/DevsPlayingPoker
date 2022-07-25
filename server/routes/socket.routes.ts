import { Router } from "../deps.ts";
import { establishSocketConnection } from "../controllers/socket.controller.ts";

const router = Router();

router.get("/", establishSocketConnection);

export default router;
