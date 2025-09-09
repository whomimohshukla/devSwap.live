// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		outDir: "dist",
		sourcemap: false,
		minify: "terser",
		target: "esnext",
	},
	server: {
		port: 3000,
		host: true,
		cors: true,
	},
	preview: {
		port: 3000,
		host: true,
	},

});
