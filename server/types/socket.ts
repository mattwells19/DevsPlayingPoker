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

export interface StartVotingEvent {
	event: "StartVoting";
}

export interface OptionSelectedEvent {
	event: "OptionSelected";
	selection: number;
}

export type WebSocketEvent =
	| ConnectEvent
	| JoinEvent
	| OptionSelectedEvent
	| RoomUpdateEvent
	| StartVotingEvent;
