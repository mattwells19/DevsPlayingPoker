import { Theme as UnoTheme } from "unocss/preset-uno";

/**
 * main orange: #f48241
 * dark orange: #de411b
 * bright greenish blue: #78fecf
 * whitish: #edf2f4
 * dark blueish: #2b2d42
 */

const theme: UnoTheme = {
	colors: {
		brand: {
			orange: "hsl(var(--orange))",
			orangeLighter: "hsl(var(--orange-lighter))",
			orangeDarker: "hsl(var(--orange-darker))",

			reddish: "hsl(var(--reddish))",
			turquoise: "hsl(var(--turquoise))",
			neutral: "hsl(var(--neutral))",

			whitish: "hsl(var(--whitish))",
			whitishLighter: "hsl(var(--whitish-lighter))",
			whitishDarker: "hsl(var(--whitish-darker))",

			navy: "hsl(var(--navy))",
			navyLighter: "hsl(var(--navy-lighter))",
			navyDarker: "hsl(var(--navy-darker))",
		},
	},
};

export type Theme = typeof theme;
export default theme;
