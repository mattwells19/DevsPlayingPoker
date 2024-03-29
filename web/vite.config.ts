import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "path";
import UnoCSS from "unocss/vite";

export default defineConfig({
	plugins: [solidPlugin(), UnoCSS()],
	resolve: {
		alias: {
			"@": path.join(__dirname, "src/"),
		},
	},
	server: {
		proxy: {
			"/api/v1": {
				target: "http://localhost:5555",
				changeOrigin: true,
			},
			"/ws": {
				target: "http://localhost:5555",
				changeOrigin: true,
				ws: true,
			},
		},
		port: 5000,
	},
	build: {
		target: "esnext",
		outDir: "../server/www",
		emptyOutDir: true,
	},
});
