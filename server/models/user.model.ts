import { ObjectId } from '../deps.ts';

export interface UserSchema {
  _id: ObjectId;
  name: string;
}
