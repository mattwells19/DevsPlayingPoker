import { ObjectId } from '../deps.ts';

export interface RoomSchema {
  _id: ObjectId;
  roomCode: string;
  moderatorId: ObjectId;
  options: number[];
}

export interface UserSchema {
  _id: ObjectId;
  name: string;
}
