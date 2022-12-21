import type { RoomSchema } from "./schemas.ts";

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

export interface ModeratorChangeEvent {
	event: "ModeratorChange";
	newModeratorId: string;
}

export interface StartVotingEvent {
	event: "StartVoting";
}

export interface StopVotingEvent {
	event: "StopVoting";
}

export interface OptionSelectedEvent {
	event: "OptionSelected";
	selection: number;
}

export type WebSocketEvent =
	| ModeratorChangeEvent
	| ConnectEvent
	| JoinEvent
	| OptionSelectedEvent
	| RoomUpdateEvent
	| StartVotingEvent
	| StopVotingEvent;
