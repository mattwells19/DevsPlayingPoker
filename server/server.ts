// loads env variables
import "https://deno.land/std@v0.168.0/dotenv/load.ts";

import { json, opine, serveStatic } from "opine";
import db from "./utils/db.ts";
import { FeRoutes, RoomRoutes, SocketRoutes } from "./routes.ts";

// Start Server
const server = opine();
server.use(json());

server.use((_, res, next) => {
	res
		// TODO: Causes issues in Safari. Needs further investigation.
		// .setHeader(
		// 	"Content-Security-Policy",
		// 	"default-src 'self'; style-src 'self' 'unsafe-inline'",
		// )
		.setHeader("Referrer-Policy", "same-origin")
		.setHeader("X-Content-Type-Options", "nosniff")
		.setHeader(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains",
		)
		.setHeader("X-Frame-Options", "SAMEORIGIN")
		.setHeader("X-XSS-Protection", "1; mode=block");

	next();
});

// Use routes
server.use("/", FeRoutes);
server.use(serveStatic("www"));
server.use("/ws", SocketRoutes);
server.use("/api/v1", RoomRoutes);

db.connect()
	.then(() => {
		server.listen(5555, () => console.info("Server started on port 5555."));
	})
	.catch((err) => {
		throw new Error(`Error connecting to DB.\n\n${err}`);
	});
