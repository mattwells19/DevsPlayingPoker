import type { NextFunction, OpineRequest, OpineResponse } from "opine";
import sockets, { type UserSocket } from "../models/sockets.ts";
import rooms from "../models/rooms.ts";
import type { WebScoketMessageEvent } from "../types/socket.ts";
import eventHandlers from "../events/mod.ts";
import handleLeave from "../events/leave.ts";

/**
 * Handles upgrading the HTTP connection to a WS connection
 */
export const upgradeWSConnection = (
	req: OpineRequest,
	_: OpineResponse,
	next: NextFunction,
): void => {
	if (req.headers.get("upgrade") === "websocket") {
		const sock = req.upgrade();
		sockets.add(sock, req.params.roomCode, req.query.userId);
	} else {
		next();
	}
};

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
	const preSocket = userSocket;
	setTimeout(async () => {
		const postSocket = sockets.get(userSocket.id);

		// same socketId but different socket object means they reconnected
		if (preSocket.socket !== postSocket?.socket) {
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

	if (data.event in eventHandlers === false) return;
	const eventFns = eventHandlers[data.event];

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
