import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "path";

export default defineConfig({
	plugins: [solidPlugin()],
	resolve: {
		alias: {
			"@": path.join(__dirname, "src/"),
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:1337",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
			"/ws": {
				target: "http://localhost:1337",
				changeOrigin: true,
				ws: true,
			},
		},
	},
	build: {
		target: "esnext",
		polyfillDynamicImport: false,
		outDir: "../server/www",
	},
});
