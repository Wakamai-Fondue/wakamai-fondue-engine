import commonjs from "@rollup/plugin-commonjs";

export default {
	input: "./index.js",
	output: {
		file: "lib/index.js",
		inlineDynamicImports: true,
		format: "cjs",
		exports: "named",
	},
	external: ["fs", "path", "util"],
	plugins: [commonjs()],
};
