import { opine, json, config, MongoClient } from "./deps.ts";
import { RoomSchema, UserSchema } from "./types/schemas.ts";
import seedDB from "./utils/seedDB.ts";
import generateRoomCode from "./utils/generateRoomCode.ts";
import addUser from "./utils/addUser.ts";
import checkIfRoomExists from "./utils/checkIfRoomExists.ts";
config({ path: "./.env" });

// Types (TODO: extract)
interface CreateRoomRequest {
	moderatorName: string;
	options: number[];
}

interface JoinRoomRequest {
	name: string;
}

// Start Server
const server = opine();
server.use(json());

// Connect to DB (TODO: extract)
const DB_URL = Deno.env.get("DB_URL");
if (!DB_URL) throw new Error("Problem importing from .env");
const client = new MongoClient();
await client.connect(DB_URL);
const db = client.database("devs_playing_poker");
const users = db.collection<UserSchema>("users");
const rooms = db.collection<RoomSchema>("rooms");

// Seed DB - Currently just deletes all users and rooms
// seedDB(rooms, users);

// Routes (TODO: extract)
server.get("/", (req, res) => {
	res.send("Landing Page");
});

server.post("/create", async (req, res) => {
	const { moderatorName, options }: CreateRoomRequest = req.body;
	const moderatorId = await users.insertOne({
		name: moderatorName,
	});

	try {
		const roomCode = await generateRoomCode(rooms);
		const room = await rooms.insertOne({
			roomCode,
			moderatorId,
			options,
			voters: [],
		});
		console.debug(
			`Room created with _id of ${room} and roomCode of ${roomCode}`,
		);

		res.setStatus(201).json({
			success: true,
			roomCode: roomCode,
			userId: moderatorId,
		});
	} catch (err) {
		console.error(`Error creating room: ${err}`);
		res.setStatus(500).json({
			success: false,
			message: err.message,
		});
	}
});

server.post("/rooms/:roomCode/join", async (req, res) => {
	const { name }: JoinRoomRequest = req.body;
	const { roomCode } = req.params;

	try {
		const room = await checkIfRoomExists(roomCode, rooms);
		if (!room) {
			throw new Error(`Room with code ${roomCode} does not exist`);
		}
		const userId = await addUser(name, users);

		await rooms.updateOne(
			{ roomCode: { $eq: roomCode } },
			{ $push: { voters: userId } },
		);
		console.debug(
			`Updated room: ${roomCode} to add voter with userId: ${userId}`,
		);
		res.setStatus(200).json({
			success: true,
			userId,
		});
	} catch (err) {
		console.error(`Error joining room: ${err}`);
		res.setStatus(500).json({
			success: false,
			message: err.message,
		});
	}
});

server.get("/rooms/:roomCode", async (req, res) => {
	const room = await rooms.findOne({ roomCode: req.params.roomCode });
	if (room) {
		return res.setStatus(200).json({
			success: true,
			room,
		});
	}
	return res.setStatus(404).json({
		success: false,
		message: `Room with roomCode of ${req.params.roomCode} not found`,
	});
});

server.head("/rooms/:roomCode", async (req, res) => {
	if (await checkIfRoomExists(req.params.roomCode, rooms)) {
		return res.setStatus(200);
	}
	return res.setStatus(204);
});

server.listen(1337, () => console.log("server started on port 1337"));
