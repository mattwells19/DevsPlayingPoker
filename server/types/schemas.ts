import type { ObjectId } from "mongo";

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
				selection: RoomSchema["options"][0];
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
	votingDescription: string;
	moderator: User | null;
	options: string[];
	/**
	 * Be careful as this may include a voting moderator
	 */
	voters: Voter[];
	votingStartedAt: Date | null;
	lastUpdated: Date;
}
