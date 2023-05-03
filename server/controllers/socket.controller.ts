import sockets, { type UserSocket } from "../models/sockets.ts";
import * as rooms from "../models/rooms.ts";
import type { WebScoketMessageEvent } from "../types/socket.ts";
import eventHandlerMap from "../events/mod.ts";
import handleLeave from "../events/leave.ts";

/**
 * WebSocket.onopen
 */
export const handleOpen = async (userSocket: UserSocket) => {
	const roomExists = await rooms.findByRoomCode(userSocket.roomCode);
	userSocket.send({
		event: "Connected",
		userId: userSocket.userId,
		roomExists: !!roomExists,
	});
};

/**
 * WebSocket.onclose
 */
export const handleClose = (userSocket: UserSocket) => {
	const preSocket = sockets.get(userSocket.id);
	setTimeout(async () => {
		const postSocket = sockets.get(userSocket.id);

		// same socketId but different socket object means they reconnected
		if (preSocket !== postSocket) {
			return;
		}

		// remove voter from room
		sockets.delete(userSocket.id);

		const roomData = await rooms.findByRoomCode(userSocket.roomCode);
		if (!roomData) return;

		await handleLeave(roomData, userSocket.userId);
		// socket is left alive for 3 seconds to allow user to rejoin
	}, 3000);
};

/**
 * WebSocket.onmessage
 */
export const handleMessage = async (
	userSocket: UserSocket,
	event: MessageEvent<string>,
): Promise<void> => {
	if (event.data === "PING") {
		return userSocket.send("PONG");
	}

	const data = JSON.parse(event.data) as WebScoketMessageEvent;

	const roomData = await rooms.findByRoomCode(userSocket.roomCode);
	if (!roomData) return;

	const eventFns = eventHandlerMap.get(data.event);
	if (!eventFns) return;

	try {
		for (const eventFn of eventFns) {
			const stop = await eventFn(roomData, { userId: userSocket.userId }, data);
			if (stop) {
				console.info(stop.message);
				break;
			}
		}
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message);
		}
	}
};
