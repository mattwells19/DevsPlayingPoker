import {
	handleClose,
	handleOpen,
	handleMessage,
} from "../controllers/socket.controller.ts";
import type { WebSocketEvent } from "../types/socket.ts";
import { RoomSchema } from "../types/schemas.ts";

type UserSocketId = `${string}-${string}`;

export class UserSocket {
	#roomCode: string;
	#userId: string;
	#socket: WebSocket;

	constructor(socket: WebSocket, roomCode: string, userId?: string) {
		this.#socket = socket;
		this.#roomCode = roomCode;
		this.#userId = userId ?? crypto.randomUUID();

		this.#socket.addEventListener("open", () => handleOpen(this));
		this.#socket.addEventListener("close", () => handleClose(this));
		this.#socket.addEventListener("message", (evt) => handleMessage(this, evt));
	}

	get id(): UserSocketId {
		return `${this.#userId}-${this.#roomCode}`;
	}

	get roomCode(): string {
		return this.#roomCode;
	}

	get userId(): string {
		return this.#userId;
	}

	get socket(): WebSocket {
		return this.#socket;
	}

	send(evtData: WebSocketEvent | RoomSchema | "PONG"): void {
		const payload: string = (() => {
			if (typeof evtData === "string") {
				return evtData;
			}
			return JSON.stringify(evtData);
		})();

		if (this.#socket.readyState === WebSocket.OPEN) {
			this.socket.send(payload);
		}
	}
}

class SocketStore {
	#sockets: Map<UserSocketId, UserSocket>;

	constructor() {
		this.#sockets = new Map<UserSocketId, UserSocket>();
	}

	add(socket: WebSocket, roomCode: string, userId?: string): void {
		const newUserSocket = new UserSocket(socket, roomCode, userId);
		const prevUserSocket = this.#sockets.get(newUserSocket.id);

		if (prevUserSocket && prevUserSocket.socket.readyState === WebSocket.OPEN) {
			prevUserSocket.socket.close();
		}

		this.#sockets.set(newUserSocket.id, newUserSocket);
	}

	delete(socketId: UserSocketId): boolean {
		return this.#sockets.delete(socketId);
	}

	has(socketId: UserSocketId): boolean {
		return this.#sockets.has(socketId);
	}

	get(socketId: UserSocketId): UserSocket | null;
	get(userId: string, roomCode: string): UserSocket | null;
	get(a: UserSocketId | string, roomCode?: string): UserSocket | null {
		if (!roomCode) {
			return this.#sockets.get(a as UserSocketId) ?? null;
		}
		return this.#sockets.get(`${a}-${roomCode}`) ?? null;
	}
}

const sockets = new SocketStore();
export default sockets;
