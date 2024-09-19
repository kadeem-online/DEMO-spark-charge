import { fileURLToPath, URL } from "node:url";
import { sync } from "glob";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import { defineConfig } from "vite";

export default defineConfig({
	appType: "mpa",
	plugins: [nodePolyfills({ include: ["url"] })],
	root: "./src",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
		rollupOptions: {
			input: sync("./src/**/*.html".replace(/\\/g, "/")),
			external: ["phaser"],
			output: {
				paths: {
					phaser:
						"https://cdnjs.cloudflare.com/ajax/libs/phaser/3.85.1/phaser.esm.min.js",
				},
			},
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: "modern",
			},
		},
	},
});
