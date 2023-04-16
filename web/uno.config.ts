import {
	defineConfig,
	presetUno,
	presetMini,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	transformers: [transformerVariantGroup()],
	presets: [presetMini(), presetUno()],
	/**
	 * main orange: #f48241
	 * dark orange: #de411b
	 * bright greenish blue: #78fecf
	 * whitish: #edf2f4
	 * dark blueish: #2b2d42
	 */
	theme: {
		colors: {
			brand: {
				orange: "#f48241",
				orangeFocus: "#db6f31",
				reddish: "#de411b",
				turquoise: "#78fecf",
				neutral: "#333333",
				whitish: "#edf2f4",
				navy: "#2b2d42",
			},
		},
	},
	shortcuts: {
		input:
			"bg-inherit border border-solid border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2",
		btn: "bg-brand-orange px-4 py-3 rounded-lg font-medium uppercase hover:bg-brand-orange-focus transition-colors text-black",
		select: "input px-3 py-2 [&>option]:(bg-brand-whitish dark:bg-brand-navy)",
		radio:
			"appearance-none cursor-pointer rounded-full w-4 h-4 border border-brand-reddish dark:border-brand-turquoise checked:(bg-brand-reddish dark:bg-brand-navy)",
		"btn-icon":
			"p-3 hover:(bg-brand-navy text-brand-whitish) dark:hover:(bg-brand-whitish text-brand-navy) rounded-lg transition-colors",
		"form-control": "flex flex-col gap-1",
	},
});
