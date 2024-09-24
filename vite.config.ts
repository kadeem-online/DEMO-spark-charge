import { fileURLToPath, URL } from "node:url";
import { sync } from "glob";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import { defineConfig } from "vite";

function filterManualChunks(id: string) {
	if (id.includes("node_modules/phaser3-rex-plugins")) {
		return "phaser3-rex-plugins";
	}
	if (id.includes("node_modules/phaser")) {
		return "phaser";
	}
}

function filterExternals(id: string) {
	if (id.includes("node_modules/phaser3-rex-plugins")) {
		return "phaser3-rex-plugins";
	}
	if (id.includes("node_modules/phaser")) {
		return "phaser";
	}
}

export default defineConfig({
	appType: "mpa",
	base: "/DEMO-spark-charge/",
	plugins: [nodePolyfills({ include: ["url"] })],
	root: "./src",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
		rollupOptions: {
			input: sync("./src/**/*.html".replace(/\\/g, "/")),
			output: {
				manualChunks: filterManualChunks,
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
