import { opine, json } from "./deps.ts";

//Import routes
import SocketRoutes from "./routes/socket.routes.ts";
import RoomRoutes from "./routes/room.routes.ts";
import FeRoutes from "./routes/fe.routes.ts";

// Start Server
const server = opine();
server.use(json());

// Use routes
server.use("/ws", SocketRoutes);
server.use("/api/v1", RoomRoutes);
server.use("/", FeRoutes);

server.listen(3000, () => console.log("server started on port 3000"));
