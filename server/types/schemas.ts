import { ObjectId } from "../deps.ts";

export interface User {
  id: string;
  name: string;
}

export type Voter = User &
  (
    | {
        confidence: 0 | 1 | 2;
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
}
