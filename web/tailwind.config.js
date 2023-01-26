/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	darkMode: "class",
	daisyui: {
		themes: [
			{
				light: {
					primary: "#f48241",
					secondary: "#de411b",
					accent: "#78fecf",
					neutral: "#f48241",
					"base-100": "#edf2f4",
					"base-content": "#2b2d42",
				},
				dark: {
					primary: "#f48241",
					secondary: "#78fecf",
					accent: "#de411b",
					neutral: "#f48241",
					"base-100": "#2b2d42",
					"base-content": "#edf2f4",
				},
			},
		],
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
