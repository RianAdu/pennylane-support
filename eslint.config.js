import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// A test title is the first argument of it(), test() or describe(), of a modifier such as it.only(), or of the
// function that it.each(...) returns.
const testTitle = (pattern) =>
  [
    "CallExpression[callee.name=/^(it|test|describe)$/]",
    "CallExpression[callee.object.name=/^(it|test|describe)$/]",
    "CallExpression[callee.callee.property.name='each']",
  ].map((call) => `${call} > Literal.arguments:first-child[value=${pattern}]`);

export default defineConfig([
  globalIgnores(["dist", "coverage", "data", "public/mockServiceWorker.js", "test-results", "playwright-report"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    rules: {
      // AGENTS.md: no `any`. Stated here so the rule survives a preset change.
      "@typescript-eslint/no-explicit-any": "error",
      // AGENTS.md, Code style: function expressions, helpers above their use, `type` over `interface`.
      "func-style": ["error", "expression"],
      "@typescript-eslint/no-use-before-define": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
  {
    // AGENTS.md, Testing rules: test names describe behaviour in plain words.
    files: ["**/*.test.{ts,tsx}", "tests/e2e/**/*.spec.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...testTitle("/%[sdifjoO#]/").map((selector) => ({
          selector,
          message: "No printf placeholders in test names. Use objects with $name, or write separate tests.",
        })),
        ...testTitle("/\\b(FR|NFR)-\\d+|\\bD\\d+\\b/").map((selector) => ({
          selector,
          message: "No requirement or decision IDs in test names. They belong in the commit message.",
        })),
      ],
    },
  },
  {
    // AGENTS.md, Code style: tests live in a __tests__ folder next to the code they test.
    files: ["src/**/*.test.{ts,tsx}"],
    ignores: ["src/**/__tests__/**"],
    rules: {
      "no-restricted-syntax": ["error", { selector: "Program", message: "Move this test into a __tests__ folder." }],
    },
  },
]);
