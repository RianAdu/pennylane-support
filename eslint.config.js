import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", "coverage", "data"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    rules: {
      // AGENTS.md: no `any`. Stated here so the rule survives a preset change.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);
