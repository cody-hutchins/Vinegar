import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";

import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

import tseslint from "typescript-eslint";

const config = defineConfig([
  { settings: { react: { version: "19" } } },
  globalIgnores(["node_modules", "**/lib", "**/*.js", "**/*.cjs", "**/*.mjs"]),
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "require-await": "warn",
      curly: ["warn", "multi-line"],
      eqeqeq: "warn",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.browser,
    },
  },
  {
    rules: {
      "react/jsx-curly-brace-presence": ["error", { props: "always", children: "never" }],
    },
  },
  tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
]);

export default config;
