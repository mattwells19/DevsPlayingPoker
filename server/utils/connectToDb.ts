import { MongoClient } from "../deps.ts";
import { UserSchema } from "../models/user.model.ts";
import { RoomSchema } from "../models/room.model.ts";

export default async () => {
	const DB_URL = Deno.env.get("DB_URL");
	if (!DB_URL) throw new Error("Problem importing from .env");
	const client = new MongoClient();
	await client.connect(DB_URL);
	const db = client.database("devs_playing_poker");

	const rooms = db.collection<RoomSchema>("rooms");
	const users = db.collection<UserSchema>("users");

	return { client, rooms, users };
};
