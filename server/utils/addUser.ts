import { users } from "./db.ts";

const addUser = async (name: string) => {
	const userId = await users.insertOne({
		name,
	});
	console.debug(`Created userId: ${userId} for name: ${name}`);
	return userId;
};

export default addUser;
