/** @type {import('tailwindcss').Config} */

/**
 * main orange: #f48241
 * dark orange: #de411b
 * bright greenish blue: #78fecf
 * whitish: #edf2f4
 * dark blueish: #2b2d42
 */

module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			ringColor: "blue",
			keyframes: {
				slideIn: {
					"0%": { transform: "translateX(100%)" },
					"100%": { transform: "translateX(0)" },
				},
				fadeIn: {
					"0%": { opacity: 0 },
					"100%": { transform: 1 },
				},
			},
		},
	},
	darkMode: "class",
	daisyui: {
		themes: [
			{
				light: {
					primary: "#f48241",
					secondary: "#de411b",
					accent: "#78fecf",
					neutral: "#333333",
					"base-100": "#edf2f4",
					"base-content": "#2b2d42",
				},
				dark: {
					primary: "#f48241",
					secondary: "#de411b",
					accent: "#78fecf",
					neutral: "#fafafa",
					"base-100": "#2b2d42",
					"base-content": "#edf2f4",
				},
			},
		],
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
