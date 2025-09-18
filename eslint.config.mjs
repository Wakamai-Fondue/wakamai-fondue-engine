import globals from "globals";
import pluginJs from "@eslint/js";

export default [
	pluginJs.configs.recommended,
	{
		ignores: ["**/third_party/", "**/lib/", "coverage/"],
	},
	{
		languageOptions: { globals: globals.browser },
	},
];
