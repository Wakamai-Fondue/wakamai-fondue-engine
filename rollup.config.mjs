import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";

export default {
	input: "./index.mjs",
	output: {
		file: "lib/index.js",
		inlineDynamicImports: true,
		format: "cjs",
		exports: "named",
	},
	external: ["fs", "path", "util"],
	plugins: [nodeResolve(), commonjs(), json()],
};
