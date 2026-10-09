import { configureAxe } from "vitest-axe";

// jsdom does not lay out or paint, so axe cannot measure colour contrast here. The rule is off rather than left to
// report "incomplete"; contrast is checked by hand against the theme tokens (DECISIONS.md, D50).
const axe = configureAxe({ rules: { "color-contrast": { enabled: false } } });

/**
 * Fails, naming each broken rule and the elements that break it. A plain function rather than an `expect` matcher:
 * vitest-axe's matcher types do not load under this TypeScript setup, and extending `expect` would need a second
 * declaration-merging interface.
 */
export const expectNoAxeViolations = async (element: Element): Promise<void> => {
  const { violations } = await axe(element);
  if (violations.length > 0) {
    const report = violations.map(({ id, help, helpUrl, nodes }) => {
      return [`${id}: ${help} (${helpUrl})`, ...nodes.map((node) => `  ${node.html}`)].join("\n");
    });
    throw new Error(`Accessibility violations:\n\n${report.join("\n\n")}`);
  }
};
