import connectToDb from "./db.ts";

const generateRoomCode = async (): Promise<string> => {
	const { rooms } = await connectToDb();

	let roomCode = getRandomCode();

	for (let i = 0; i < 5; i++) {
		const duplicateCode = await rooms.findOne({ roomCode });

		if (!duplicateCode) return roomCode;

		console.debug(
			`Duplicate room code found, generating again. Retried ${i + 1} times.`,
		);
		roomCode = getRandomCode();
	}

	throw new Error("Unable to generate unique room code");
};

const getRandomCode = () => {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	for (let i = 0; i < 4; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

export default generateRoomCode;
