import { opine, json } from "./deps.ts";

import connectToDb from "./utils/db.ts";
import { handleCookie } from "./middlewares/cookies.ts";

//Import routes
import SocketRoutes from "./routes/socket.routes.ts";
import RoomRoutes from "./routes/room.routes.ts";
import FeRoutes from "./routes/fe.routes.ts";

// Start Server
const server = opine();
server.use(json());

server.use(handleCookie);

// Use routes
server.use("/ws", SocketRoutes);
server.use("/api/v1", RoomRoutes);
server.use("/", FeRoutes);

connectToDb()
	.then(() => {
		server.listen(5555, () => console.info("Server started on port 5555."));
	})
	.catch((err) => {
		throw new Error(`Error connecting to DB.\n\n${err}`);
	});
