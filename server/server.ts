import { opine, json } from "./deps.ts";

// Start Server
const server = opine();
server.use(json());

//Import routes
import RoomRoutes from "./routes/room.routes.ts";
import FeRoutes from "./routes/fe.routes.ts";

// Use routes
server.use("/api/v1", RoomRoutes);
server.use("/", FeRoutes);

server.listen(3000, () => console.log("server started on port 3000"));
