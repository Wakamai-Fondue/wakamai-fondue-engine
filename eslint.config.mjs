import globals from "globals";
import pluginJs from "@eslint/js";

export default [
	{
		languageOptions: { globals: globals.browser },
	},
	pluginJs.configs.recommended,
	{
		files: ["test/**/*"],
		languageOptions: {
			globals: {
				...globals.browser,
				describe: "readonly",
				test: "readonly",
				it: "readonly",
				expect: "readonly",
			},
		},
	},
	{
		ignores: ["**/third_party/", "**/lib/", "coverage/"],
	},
];
