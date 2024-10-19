import { defineConfig } from "vite";

export default defineConfig({
	test: {
		setupFiles: ["./test/support/no-experimental-fetch.mjs"],
	},
});
