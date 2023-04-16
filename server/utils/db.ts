import { PrismaClient } from "prisma";

// automatically remove rooms that haven't been updated after `expireAfterSeconds` time
// const StaleRoomIndex: IndexOptions = {
// 	key: {
// 		lastUpdated: 1,
// 	},
// 	expireAfterSeconds: 60 * 60, // 1 hour
// 	name: "StaleRooms",
// };

const db = new PrismaClient();
export default db;
