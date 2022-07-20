import { opine, json, config, MongoClient } from "./deps.ts";
import { RoomSchema } from "./types/schemas.ts";
import generateRoomCode from "./utils/generateRoomCode.ts";
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
const rooms = db.collection<RoomSchema>("rooms");

// Seed DB - Currently just deletes all users and rooms
// seedDB(rooms, users);

// Routes (TODO: extract)
server.get("/", (req, res) => {
  res.send("Landing Page");
});

// TODO: extract WebSocket stuff to its own file
interface JoinEvent {
  event: "Join";
  roomCode: string;
  name: string;
}

type WebSocketEvent = JoinEvent;

const sockets = new Map<string, WebSocket>();

export const handleWs = (socket: WebSocket) => {
  const userId: string = crypto.randomUUID();
  sockets.set(userId, socket);
  let isModerator = false;

  socket.addEventListener("open", () => {
    socket.send("Connected");
  });

  socket.addEventListener("close", async () => {
    console.log("close", userId);

    // remove voter from room
    sockets.delete(userId);

    console.log(isModerator);

    let updatedRoomData: RoomSchema | undefined;

    if (isModerator) {
      const roomData = await rooms.findOne({
        "moderator.id": userId,
      });

      if (!roomData) return;

      if (roomData.voters.length > 0) {
        const newModerator = roomData.voters[0];

        updatedRoomData = await rooms.findAndModify(
          { _id: roomData._id },
          {
            update: {
              $set: {
                moderator: { id: newModerator.id, name: newModerator.name },
              },
              $pull: { voters: { id: newModerator.id } },
            },
            new: true,
          }
        );
      } else {
        await rooms.deleteOne({
          "moderator.id": userId,
        });
        return;
      }
    } else {
      updatedRoomData = await rooms.findAndModify(
        {
          voters: { $elemMatch: { id: userId } },
        },
        {
          update: {
            $pull: { voters: { id: userId } },
          },
          new: true,
        }
      );
    }

    if (!updatedRoomData) return;

    if (updatedRoomData.moderator) {
      const moderatorSock = sockets.get(updatedRoomData.moderator.id);
      moderatorSock?.send(
        JSON.stringify({
          event: "RoomUpdate",
          data: updatedRoomData,
        })
      );
    }

    updatedRoomData.voters.forEach(({ id: voterId }) => {
      const voterSock = sockets.get(voterId.toString());
      voterSock?.send(
        JSON.stringify({
          event: "RoomUpdate",
          data: updatedRoomData,
        })
      );
    });
  });

  socket.addEventListener(
    "message",
    async (event: MessageEvent<string>): Promise<void> => {
      const data = JSON.parse(event.data) as WebSocketEvent;
      console.log("message", data);

      switch (data.event) {
        case "Join": {
          const roomData = await rooms.findOne({
            roomCode: data.roomCode,
          });

          if (!roomData) {
            throw new Error(`Room does not exist with code ${data.roomCode}`);
          }

          if (!roomData.moderator) {
            isModerator = true;
          }

          const updatedRoomData = await rooms.findAndModify(
            { _id: roomData._id },
            {
              update: roomData.moderator
                ? {
                    $push: {
                      voters: {
                        $each: [
                          {
                            id: userId,
                            name: data.name,
                            confidence: null,
                            selection: null,
                          },
                        ],
                      },
                    },
                  }
                : { $set: { moderator: { id: userId, name: data.name } } },
              new: true,
            }
          );

          if (!updatedRoomData) {
            throw new Error(
              `Updating room failed for room code ${data.roomCode}.`
            );
          }

          if (updatedRoomData.moderator) {
            const moderatorSock = sockets.get(updatedRoomData?.moderator?.id);
            moderatorSock?.send(
              JSON.stringify({
                event: "RoomUpdate",
                data: updatedRoomData,
              })
            );
          }

          updatedRoomData?.voters.forEach(({ id: voterId }) => {
            const voterSock = sockets.get(voterId);
            voterSock?.send(
              JSON.stringify({
                event: "RoomUpdate",
                data: updatedRoomData,
              })
            );
          });
        }
      }
    }
  );
};

server.get("/ws", async (req, res, next) => {
  console.log(req.headers.get("upgrade"));

  if (req.headers.get("upgrade") === "websocket") {
    const sock = req.upgrade();
    await handleWs(sock);
  } else {
    res.send("You've gotta set the magic header...");
  }

  next();
});

server.post("/create", async (req, res) => {
  const { options }: CreateRoomRequest = req.body;

  try {
    const roomCode = await generateRoomCode(rooms);
    const room = await rooms.insertOne({
      roomCode,
      state: "Results",
      moderator: null,
      options,
      voters: [],
    });
    console.debug(
      `Room created with _id of ${room} and roomCode of ${roomCode}`
    );

    res.setStatus(201).json({
      success: true,
      roomCode: roomCode,
    });
  } catch (err) {
    console.error(`Error creating room: ${err}`);
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
