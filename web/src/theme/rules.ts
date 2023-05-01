import type { Rule } from "unocss";
import type { Theme } from "./theme";

const rules: Array<Rule<Theme>> = [
	// design inspired by Daisy UI's radio input
	// https://unocss.dev/config/theme#usage-in-rules
	[
		/^radio-inset-(.*)$/,
		([, c], { theme }) => {
			const levels = c.split("-");
			const color = levels.reduce(
				(prev, curr) => prev[curr] as any,
				theme.colors!,
			);
			return {
				"box-shadow": `0 0 0 3px ${color?.toString()} inset, 0 0 0 3px ${color?.toString()} inset`,
			};
		},
	],
	[
		/^arrow-bg-(.*)$/,
		([, c], { theme }) => {
			const levels = c.split("-");
			const color = levels.reduce(
				(prev, curr) => prev[curr] as any,
				theme.colors!,
			);
			return {
				"--arrow-background": color?.toString(),
			};
		},
	],
	[
		/^arrow-w-(.*)$/,
		([, size]) => {
			return {
				"--arrow-size": size,
			};
		},
	],
];

export default rules;
