import type { RoomSchema } from "./schemas.ts";

export interface ConnectEvent {
	event: "Connected";
	userId: string;
	roomExists: boolean;
}

export interface RoomUpdateEvent {
	event: "RoomUpdate";
	roomData: RoomSchema;
}

export interface JoinEvent {
	event: "Join";
	name: string;
	roomPassword: string | null;
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
	selection: RoomSchema["options"][0];
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

export interface IncorrectRoomPasswordEvent {
	event: "IncorrectRoomPasswordEvent";
}

export interface VotingDescriptionEvent {
	event: "UpdateVotingDescription";
	value: string;
}

export interface ChangeNameEvent {
	event: "ChangeName";
	value: string;
}

/**
 * Events triggered from the server
 */
export type WebSocketTriggeredEvent =
	| ConnectEvent
	| RoomUpdateEvent
	| KickedEvent
	| IncorrectRoomPasswordEvent;

/**
 * Events triggered by the client
 */
export type WebScoketMessageEvent =
	| JoinEvent
	| ModeratorChangeEvent
	| OptionSelectedEvent
	| StartVotingEvent
	| StopVotingEvent
	| KickVoterEvent
	| VotingDescriptionEvent
	| ChangeNameEvent;

export type WebSocketEvent = WebSocketTriggeredEvent | WebScoketMessageEvent;
