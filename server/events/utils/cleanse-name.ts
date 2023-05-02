import type { RoomSchema } from "../../types/schemas.ts";

/**
 * Prevents duplicate names and enforces max name length
 * @param origName The name to be cleansed
 * @param roomData The room data to check for duplicate names
 * @returns The cleansed name
 */
const cleanseName = (origName: string, roomData: RoomSchema) => {
	// max name length of 20 characters (not including potential name counter)
	const trimmedName = origName.trim().substring(0, 20);

	const allPeopleInRoom = [
		roomData.moderator?.name,
		...roomData.voters.map((voter) => voter.name),
	];

	const isNameAlreadyUsed = (nameToCheck: string) =>
		allPeopleInRoom.some(
			(personInRoom) =>
				personInRoom?.toLowerCase().localeCompare(nameToCheck.toLowerCase()) ===
				0,
		);

	let cnt = 1;
	let newUserName = trimmedName;
	while (isNameAlreadyUsed(newUserName)) {
		if (cnt === 10) {
			throw new Error("Too many duplicate names. Suspected bad behavior.");
		}

		newUserName = trimmedName + ` (${cnt})`;
		cnt++;
	}

	return newUserName;
};

export default cleanseName;
