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
	selection: number | string;
}

export interface KickVoterEvent {
	event: "KickVoter";
	voterId: string;
}

/**
 * Event sent to the kicked voter
 */
export interface KickedEvent {
	event: "Kicked";
}

/**
 * Events triggered from the server
 */
export type WebSocketTriggeredEvent =
	| ConnectEvent
	| RoomUpdateEvent
	| KickedEvent;

/**
 * Events triggered by the client
 */
export type WebScoketMessageEvent =
	| JoinEvent
	| ModeratorChangeEvent
	| OptionSelectedEvent
	| StartVotingEvent
	| StopVotingEvent
	| KickVoterEvent;

export type WebSocketEvent = WebSocketTriggeredEvent | WebScoketMessageEvent;
