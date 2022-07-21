import type { RoomSchema } from "../models/room.model.ts";

export interface ConnectEvent {
	event: "Connected";
	userId: string;
}

export interface RoomUpdateEvent {
	event: "RoomUpdate";
	roomData: RoomSchema;
}

export interface JoinEvent {
	event: "Join";
	roomCode: string;
	name: string;
}

export type WebSocketEvent = ConnectEvent | JoinEvent | RoomUpdateEvent;
