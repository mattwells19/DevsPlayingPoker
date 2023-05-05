/**
 * Prevents duplicate names and enforces max name length
 * @param origName The name to be cleansed
 * @param roomData The room data to check for duplicate names
 * @returns The cleansed name
 */
const cleanseName = (origName: string, allNamesInRoom: Array<string>) => {
	// max name length of 20 characters (not including potential name counter)
	const trimmedName = origName.trim().substring(0, 20);

	const isNameAlreadyUsed = (nameToCheck: string) =>
		allNamesInRoom.some(
			(nameInRoom) =>
				nameInRoom.toLowerCase().localeCompare(nameToCheck.toLowerCase()) === 0,
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
