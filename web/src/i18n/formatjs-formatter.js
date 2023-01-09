/**
 * Function used by formatjs to compile tranlsation files for better performance
 */
exports.compile = (msgs) => {
	const formattedMsgs = {};
	Object.entries(msgs).forEach(([key, value]) => {
		if (value.length > 0) {
			formattedMsgs[key] = value;
		}
	});
	return formattedMsgs;
};
