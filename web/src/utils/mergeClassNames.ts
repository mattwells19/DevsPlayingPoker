export default function mergeClassNames(
	...classNames: Array<string | undefined>
): string | undefined {
	const joinedClassName = classNames.join(" ").trim();
	return joinedClassName.length > 0 ? joinedClassName : undefined;
}
