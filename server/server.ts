import { opine, json, config, MongoClient, ObjectId } from './deps.ts';
import generateRoomCode from './utils/generateRoomCode.ts';
config({ path: './server/.env' });

// Types (TODO: extract)
type OptionType = 'Fibonacci' | 'Linear';

interface CreateRoomRequest {
  userId?: string;
  moderatorName: string;
  optionType: OptionType;
  numberOfOptions: number;
  noVote: boolean;
}

interface RoomSchema {
  _id: ObjectId;
  roomCode: string;
  moderatorId: ObjectId;
  optionType: OptionType;
  numberOfOptions: number;
  noVote: boolean;
}

interface UserSchema {
  _id: ObjectId;
  name: string;
}

// Start Server
const server = opine();
server.use(json());

// Connect to DB (TODO: extract)
const DB_URL = Deno.env.get('DB_URL');
if (!DB_URL) throw new Error('Problem importing from .env');
const client = new MongoClient();
await client.connect(DB_URL);
const db = client.database('devs_playing_poker');
const users = db.collection<UserSchema>('users');
const rooms = db.collection<RoomSchema>('rooms');

// Routes (TODO: extract)
server.get('/', (req, res) => {
  res.send('Landing Page');
});

server.post('/create', async (req, res) => {
  const { userId, moderatorName, optionType, numberOfOptions, noVote }: CreateRoomRequest =
    req.body;
  let moderatorId;

  if (!userId) {
    console.log('No userId included, creating new');
    // TODO: extract
    moderatorId = await users.insertOne({
      name: moderatorName,
    });
  } else {
    const moderator = await users.findOne({ _id: new ObjectId(userId) });
    if (!moderator) {
      return res.setStatus(404).json({
        success: false,
        message: `User with ID of ${userId} not found.`,
      });
    }
    moderatorId = moderator._id;
  }
  const roomCode = generateRoomCode();

  const room = await rooms.insertOne({
    roomCode,
    moderatorId,
    optionType,
    numberOfOptions,
    noVote,
  });

  res.json({
    roomCode: roomCode,
    userId: moderatorId,
  });
});

server.listen(3000, () => console.log('server started on port 3000'));
