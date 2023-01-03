import { Collection, Database, IndexOptions, MongoClient } from "../deps.ts";
import { RoomSchema, SessionSchema } from "../types/schemas.ts";

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

class MongoDb {
	#db: Database | null = null;
	#collectionList: Array<string> | null = null;

	/* Collections */
	#rooms: Collection<RoomSchema> | null = null;
	#sessions: Collection<SessionSchema> | null = null;

	constructor() {}

	async #initCollection<T>(
		collectionName: string,
		indexMap?: Map<string, IndexOptions>,
	): Promise<Collection<T>> {
		if (!this.#db || !this.#collectionList) {
			throw new Error("Need to run connect function.");
		}

		const collection = await (() => {
			if (this.#collectionList.includes(collectionName)) {
				return this.#db.collection<T>(collectionName);
			} else {
				console.info(`\nCreating collection: '${collectionName}'`);
				return this.#db.createCollection<T>(collectionName);
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
				console.info(
					`Creating indexes for '${collectionName}' collection:`,
					indexesToAdd.map((index) => index.name).join(", "),
				);
				await collection.createIndexes({ indexes: indexesToAdd });
			}
		}

		return collection;
	}

	async connect() {
		const DB_URL = Deno.env.get("DB_URL");
		if (!DB_URL) throw new Error("Problem importing from .env");

		const client = new MongoClient();
		this.#db = await client.connect(`${DB_URL}/devs_playing_poker`);
		this.#collectionList = await this.#db.listCollectionNames();

		const collections = await Promise.all([
			this.#initCollection<RoomSchema>("rooms", RoomIndexes),
			this.#initCollection<SessionSchema>("sessions", SessionIndexes),
		]);

		this.#rooms = collections[0];
		this.#sessions = collections[1];
	}

	public get rooms(): Collection<RoomSchema> {
		if (!this.#rooms) {
			throw new Error(
				"Looks like you tried to access a collection before running the 'connect' method. You can't do that.",
			);
		}

		return this.#rooms;
	}

	public get sessions(): Collection<SessionSchema> {
		if (!this.#sessions) {
			throw new Error(
				"Looks like you tried to access a collection before running the 'connect' method. You can't do that.",
			);
		}

		return this.#sessions;
	}

	public get initialized(): boolean {
		return !!this.#db;
	}
}

const db = new MongoDb();
export default db;
