import {
	defineConfig,
	presetUno,
	transformerVariantGroup,
	transformerDirectives,
} from "unocss";
import { rules, shortcuts, theme } from "./src/theme";

export default defineConfig({
	transformers: [transformerDirectives(), transformerVariantGroup()],
	presets: [presetUno()],
	theme,
	layers: {
		reset: 0,
		base: 1,
		rules: 2,
		default: 3,
	},
	rules,
	shortcuts,
	shortcutsLayer: "rules",
	// these rules get filtered out since they're not in a class
	// but they're needed for the animations in useModal
	safelist: [
		"modal-opening",
		"modal-closing",
		"drawer-opening",
		"drawer-closing",
	],
});
