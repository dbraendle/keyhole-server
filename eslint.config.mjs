import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig([
	globalIgnores(["node_modules", "data", "coverage"]),
	js.configs.recommended,
	{
		files: ["**/*.ts"],
		extends: [tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			globals: globals.node,
			parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
		},
	},
	{
		// node:test's test() returns a promise the runner tracks itself.
		files: ["test/**/*.ts"],
		rules: { "@typescript-eslint/no-floating-promises": "off" },
	},
	{ files: ["eslint.config.mjs"], languageOptions: { globals: globals.node } },
]);
