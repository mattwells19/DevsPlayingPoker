/**
 * Replaces '{}' wrapped variables in the message with value specified in 'values' dictionary.
 * For example: The msg: `Hello world, I'm {name}!` and the values: { name: 'Matt' } would return: `Hello world, I'm Matt!`
 * @param msg Message to format
 * @param values Dictionary of values to replace in message
 * @returns Message with specified values replaced
 */
export default function (
	msg: string,
	values: Record<string, any> | undefined,
): string {
	if (!values) return msg;

	return Object.entries(values).reduce(
		(prev, [key, value]) => prev.replace(`{${key}}`, value),
		msg,
	);
}
