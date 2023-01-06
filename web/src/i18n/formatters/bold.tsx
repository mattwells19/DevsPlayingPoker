import type { JSXElement } from "solid-js";

/**
 * Checks a string for text wrapped in '*' characters and wrap with bolded JSX
 * @param msg Message to check for bold formatting
 * @returns JSX version of msg with marked areas bolded
 */
export default function (msg: string): string | JSXElement {
	const boldSplit = msg.split("*");
	// make sure there's at least 2 '*' characters in the string
	if (boldSplit.length < 3) {
		return msg;
	}

	return (
		<>
			{boldSplit.map((split, index) => {
				if (index % 2 === 0) {
					return split;
				} else {
					return <b>{split}</b>;
				}
			})}
		</>
	);
}
