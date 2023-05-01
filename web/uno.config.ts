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
});
