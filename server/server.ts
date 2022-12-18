import { opine, json, getCookies, setCookie, ObjectId } from "./deps.ts";

//Import routes
import SocketRoutes from "./routes/socket.routes.ts";
import RoomRoutes from "./routes/room.routes.ts";
import FeRoutes from "./routes/fe.routes.ts";
import connectToDb from "./utils/db.ts";
import constants from "./utils/constants.ts";

// Start Server
const server = opine();
server.use(json());

const { sessions } = await connectToDb();

server.use(async (req, res, next) => {
	const cookies = getCookies(req.headers);
	const sessionId = cookies["session"];

	console.debug("sessionId", sessionId, "environment", constants.environment);

	if (sessionId) {
		const session = await sessions.findOne({
			_id: new ObjectId(sessionId),
			environment: constants.environment,
		});
		console.debug("session", session);
		if (session && session.maxAge > Date.now()) {
			return next();
		}
	}

	const maxAge = Date.now() + constants.sessionTimeout;
	await sessions
		.insertOne({
			maxAge,
			environment: constants.environment,
		})
		.then((newSession) => {
			if (!res.headers) {
				res.headers = new Headers();
			}

			setCookie(res.headers, {
				name: "session",
				value: newSession.toString(),
				maxAge,
				path: "/",
				sameSite: "Strict",
				secure: constants.environment !== "local",
				httpOnly: true,
			});

			next();
		});
});

// Use routes
server.use("/ws", SocketRoutes);
server.use("/api/v1", RoomRoutes);
server.use("/", FeRoutes);

server.listen(5555, () => console.info("Server started on port 5555."));
