import {
	defineConfig,
	presetUno,
	transformerVariantGroup,
	transformerDirectives,
} from "unocss";

export default defineConfig({
	transformers: [transformerDirectives(), transformerVariantGroup()],
	presets: [presetUno()],
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
				orange: "hsl(var(--orange))",
				orangeFocus: "hsl(var(--orangeFocus))",
				reddish: "hsl(var(--reddish))",
				turquoise: "hsl(var(--turquoise))",
				neutral: "hsl(var(--neutral))",
				whitish: "hsl(var(--whitish))",
				navy: "hsl(var(--navy))",
			},
		},
	},
	shortcutsLayer: "rules",
	layers: {
		reset: 0,
		base: 1,
		rules: 2,
		default: 3,
	},
	rules: [
		// design inspired by Daisy UI's radio input
		// https://unocss.dev/config/theme#usage-in-rules
		[
			/^radio-inset-(.*)$/,
			([, brandColor], { theme }) => {
				return {
					"box-shadow": `0 0 0 3px ${
						theme.colors!.brand[brandColor]
					} inset, 0 0 0 3px ${theme.colors!.brand[brandColor]} inset`,
				};
			},
		],
	],
	shortcuts: {
		input:
			"bg-inherit border border-solid border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2",
		"btn-base":
			"flex items-center justify-center rounded-lg font-medium px-4 py-3 uppercase transition-colors",
		btn: "btn-base bg-brand-orange hover:bg-brand-orange-focus text-black",
		"btn-ghost":
			"btn-base bg-transparent text-inherit hover:(bg-brand-navy bg-opacity-10) dark:hover:(bg-brand-whitish bg-opacity-10)",
		"btn-outline": "btn-ghost border border-current",
		"btn-sm": "text-sm px-2 py-1.5",
		select: "input px-3 py-2 [&>option]:(bg-brand-whitish dark:bg-brand-navy)",
		radio:
			"appearance-none cursor-pointer rounded-full w-4 h-4 border border-brand-reddish dark:border-brand-turquoise checked:(radio-inset-whitish bg-brand-reddish dark:bg-brand-turquoise dark:radio-inset-navy)",
		"btn-icon":
			"p-3 bg-transparent hover:(bg-brand-navy text-brand-whitish) dark:hover:(bg-brand-whitish text-brand-navy) rounded-lg transition-colors",
		"form-control": "flex flex-col gap-1",
		"label-required": "after:(content-['*'] text-red ml-1)",
		"border-color": "border-gray-300 dark:border-slate-600",
	},
});
