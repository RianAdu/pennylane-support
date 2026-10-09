import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export type Role = "learner" | "admin";

/** The key the app keeps the viewer's role under (`ROLE_STORAGE_KEY` in the RoleProvider). */
const ROLE_STORAGE_KEY = "pennylane-support:role";

/** A thread with an accepted answer, a further reply and a challenge, so every part of the thread page shows. */
export const THREAD_PATH = "/threads/CONV_0134";

/** Sets who is viewing before the app loads, as a returning viewer's browser would have it. */
export const asRole = async (page: Page, role: Role): Promise<void> => {
  await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [
    ROLE_STORAGE_KEY,
    role,
  ] as const);
};

/** Opens `path` and waits until the page's title is on screen and no skeleton is left. */
export const openPage = async (page: Page, path: string): Promise<void> => {
  await page.goto(path);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".MuiSkeleton-root")).toHaveCount(0);
};

/**
 * Fails with the rule and the element of each WCAG 2.2 AA violation on the page. Unlike the component tests, this
 * runs in a real browser, so colour contrast is checked too.
 */
export const expectNoAxeViolations = async (page: Page): Promise<void> => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const report = violations.flatMap(({ id, help, nodes }) => nodes.map((node) => `${id} (${help}): ${node.html}`));
  expect(report).toEqual([]);
};
