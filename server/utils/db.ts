import { Collection, Database, IndexOptions, MongoClient } from "../deps.ts";
import { RoomSchema, SessionSchema } from "../types/schemas.ts";

let mongo_db: Database | null = null;

async function getCollection<T>(
	collectionName: string,
	indexMap?: Map<string, IndexOptions>,
): Promise<Collection<T>> {
	const db = await (async () => {
		if (mongo_db) return Promise.resolve(mongo_db);

		const DB_URL = Deno.env.get("DB_URL");
		if (!DB_URL) throw new Error("Problem importing from .env");
		const client = new MongoClient();
		mongo_db = await client.connect(`${DB_URL}/devs_playing_poker`);
		return mongo_db;
	})();

	const collectionList = await db.listCollectionNames();

	const collection = await (async () => {
		if (collectionList.includes(collectionName)) {
			return db.collection<T>(collectionName);
		} else {
			return await db.createCollection<T>(collectionName);
		}
	})();

	if (indexMap) {
		const collectionIndexes = await collection
			.listIndexes()
			.toArray()
			.then((indexes) => indexes.map((index) => index.name));

		const indexesToAdd = Array.from(indexMap.keys())
			.filter((indexName) => !collectionIndexes.includes(indexName))
			.map((indexName) => indexMap.get(indexName)!);

		if (indexesToAdd.length > 0) {
			await collection.createIndexes({ indexes: indexesToAdd });
		}
	}

	return collection;
}

const RoomCodeIndex: IndexOptions = {
	key: {
		roomCode: "text",
	},
	name: "RoomCode",
	unique: true,
};

// automatically remove rooms that haven't been updated after `expireAfterSeconds` time
const StaleRoomIndex: IndexOptions = {
	key: {
		lastUpdated: 1,
	},
	expireAfterSeconds: 60 * 60, // 1 hour
	name: "StaleRooms",
};

// automatically remove sessions that have expired based on the maxAge time
const StaleSessionIndex: IndexOptions = {
	key: {
		maxAge: 1,
	},
	// setting this to 0 will cause the document to expire at maxAge datetime
	expireAfterSeconds: 0,
	name: "StaleSessions",
};

const RoomIndexes = new Map([
	["RoomCode", RoomCodeIndex],
	["StaleRooms", StaleRoomIndex],
]);
const SessionIndexes = new Map([["StaleSessions", StaleSessionIndex]]);

const connectToDb = async () => {
	const rooms = await getCollection<RoomSchema>("rooms", RoomIndexes);

	const sessions = await getCollection<SessionSchema>(
		"sessions",
		SessionIndexes,
	);

	return { rooms, sessions };
};

export default connectToDb;
