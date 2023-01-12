import { opine, json } from "./deps.ts";
import db from "./utils/db.ts";

//Import routes
import SocketRoutes from "./routes/socket.routes.ts";
import RoomRoutes from "./routes/room.routes.ts";
import FeRoutes from "./routes/fe.routes.ts";

// Start Server
const server = opine();
server.use(json());

// Use routes
server.use("/", FeRoutes);
server.use("/ws", SocketRoutes);
server.use("/api/v1", RoomRoutes);

db.connect()
	.then(() => {
		server.listen(5555, () => console.info("Server started on port 5555."));
	})
	.catch((err) => {
		throw new Error(`Error connecting to DB.\n\n${err}`);
	});
