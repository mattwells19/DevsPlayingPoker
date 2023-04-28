/// <reference types="vitest" />
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
	test: {
		globals: true,
		setupFiles: [
			"node_modules/@testing-library/jest-dom/extend-expect",
			"./setupVitest.ts",
		],
		transformMode: { web: [/\.[jt]sx?$/] },
	},
});
