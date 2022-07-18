import { Collection } from '../deps.ts';
import { UserSchema } from "../types/schemas.ts";

const addUser = async (name: string, users: Collection<UserSchema>) => {
  const userId = await users.insertOne({
    name,
  });
  console.debug(`Created userId: ${userId} for name: ${name}`);
  return userId;
};

export default addUser;
