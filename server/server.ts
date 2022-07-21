import { opine, json } from "./deps.ts";

//Import routes
import RoomRoutes from "./routes/room.routes.ts";
import FeRoutes from "./routes/fe.routes.ts";

// Start Server
const server = opine();
server.use(json());

// Use routes
server.use("/api/v1", RoomRoutes);
server.use("/", FeRoutes);

interface JoinEvent {
	event: "Join";
	roomCode: string;
	name: string;
}

type WebSocketEvent = JoinEvent;

const sockets = new Map<string, WebSocket>();

export const handleWs = (socket: WebSocket) => {
	const userId: string = crypto.randomUUID();
	sockets.set(userId, socket);
	let isModerator = false;

	socket.addEventListener("open", () => {
		socket.send("Connected");
	});

	socket.addEventListener("close", async () => {
		console.log("close", userId);

		// remove voter from room
		sockets.delete(userId);

		console.log(isModerator);

		let updatedRoomData: RoomSchema | undefined;

		if (isModerator) {
			const roomData = await rooms.findOne({
				"moderator.id": userId,
			});

			if (!roomData) return;

			if (roomData.voters.length > 0) {
				const newModerator = roomData.voters[0];

				updatedRoomData = await rooms.findAndModify(
					{ _id: roomData._id },
					{
						update: {
							$set: {
								moderator: { id: newModerator.id, name: newModerator.name },
							},
							$pull: { voters: { id: newModerator.id } },
						},
						new: true,
					},
				);
			} else {
				await rooms.deleteOne({
					"moderator.id": userId,
				});
				return;
			}
		} else {
			updatedRoomData = await rooms.findAndModify(
				{
					voters: { $elemMatch: { id: userId } },
				},
				{
					update: {
						$pull: { voters: { id: userId } },
					},
					new: true,
				},
			);
		}

		if (!updatedRoomData) return;

		if (updatedRoomData.moderator) {
			const moderatorSock = sockets.get(updatedRoomData.moderator.id);
			moderatorSock?.send(
				JSON.stringify({
					event: "RoomUpdate",
					data: updatedRoomData,
				}),
			);
		}

		updatedRoomData.voters.forEach(({ id: voterId }) => {
			const voterSock = sockets.get(voterId.toString());
			voterSock?.send(
				JSON.stringify({
					event: "RoomUpdate",
					data: updatedRoomData,
				}),
			);
		});
	});

	socket.addEventListener(
		"message",
		async (event: MessageEvent<string>): Promise<void> => {
			const data = JSON.parse(event.data) as WebSocketEvent;
			console.log("message", data);

			switch (data.event) {
				case "Join": {
					const roomData = await rooms.findOne({
						roomCode: data.roomCode,
					});

					if (!roomData) {
						throw new Error(`Room does not exist with code ${data.roomCode}`);
					}

					if (!roomData.moderator) {
						isModerator = true;
					}

					const updatedRoomData = await rooms.findAndModify(
						{ _id: roomData._id },
						{
							update: roomData.moderator
								? {
										$push: {
											voters: {
												$each: [
													{
														id: userId,
														name: data.name,
														confidence: null,
														selection: null,
													},
												],
											},
										},
								  }
								: { $set: { moderator: { id: userId, name: data.name } } },
							new: true,
						},
					);

					if (!updatedRoomData) {
						throw new Error(
							`Updating room failed for room code ${data.roomCode}.`,
						);
					}

					if (updatedRoomData.moderator) {
						const moderatorSock = sockets.get(updatedRoomData?.moderator?.id);
						moderatorSock?.send(
							JSON.stringify({
								event: "RoomUpdate",
								data: updatedRoomData,
							}),
						);
					}

					updatedRoomData?.voters.forEach(({ id: voterId }) => {
						const voterSock = sockets.get(voterId);
						voterSock?.send(
							JSON.stringify({
								event: "RoomUpdate",
								data: updatedRoomData,
							}),
						);
					});
				}
			}
		},
	);
};

server.get("/ws", async (req, res, next) => {
	console.log(req.headers.get("upgrade"));

	if (req.headers.get("upgrade") === "websocket") {
		const sock = req.upgrade();
		await handleWs(sock);
	} else {
		res.send("You've gotta set the magic header...");
	}

	next();
});

server.listen(3000, () => console.log("server started on port 3000"));
