import { ObjectId } from "../deps.ts";

export interface User {
	id: string;
	name: string;
}

export enum ConfidenceValue {
	low = 0,
	medium = 1,
	high = 2,
}

export type Voter = User &
	(
		| {
				confidence: ConfidenceValue;
				selection: number;
		  }
		| {
				confidence: null;
				selection: null;
		  }
	);

export interface RoomSchema {
	_id: ObjectId;
	state: "Voting" | "Results";
	roomCode: string;
	moderator: User | null;
	options: number[];
	voters: Voter[];
	votingStartedAt: Date | null;
}

export interface SessionSchema {
	_id: ObjectId;
	maxAge: number;
}
