import { Database, MongoClient } from "../deps.ts";
import { RoomSchema, SessionSchema } from "../types/schemas.ts";

let mongo_db: Database | null = null;

const connectToDb = async () => {
	const db = await (async () => {
		if (mongo_db) return Promise.resolve(mongo_db);

		const DB_URL = Deno.env.get("DB_URL");
		if (!DB_URL) throw new Error("Problem importing from .env");
		const client = new MongoClient();
		mongo_db = await client.connect(`${DB_URL}/devs_playing_poker`);
		return mongo_db;
	})();

	const collectionList = await db.listCollectionNames();

	const rooms = collectionList.includes("rooms")
		? db.collection<RoomSchema>("rooms")
		: await db.createCollection<RoomSchema>("rooms");
	const sessions = collectionList.includes("sessions")
		? db.collection<SessionSchema>("sessions")
		: await db.createCollection<SessionSchema>("sessions");

	return { rooms, sessions };
};

export default connectToDb;
