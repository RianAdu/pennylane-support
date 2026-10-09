import { test } from "@playwright/test";
import { asRole, openPage, THREAD_PATH, type Role } from "./support";

// One setting for every image in docs/screenshots, so the screens can be compared side by side: the whole page, at
// both widths the design is checked at, one device pixel per CSS pixel.
const WIDTHS = [
  { width: 1440, height: 900 },
  { width: 375, height: 812 },
];
const SCREENS: { name: string; path: string; role: Role }[] = [
  { name: "community", path: "/", role: "learner" },
  { name: "thread", path: THREAD_PATH, role: "learner" },
  { name: "challenges", path: "/challenges", role: "learner" },
  { name: "insights", path: "/insights", role: "admin" },
];

for (const { name, path, role } of SCREENS) {
  for (const viewport of WIDTHS) {
    test(`${name} at ${viewport.width} px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await asRole(page, role);
      await openPage(page, path);
      await page.evaluate(() => document.fonts.ready);
      // The window is made as tall as the page rather than stitching a scrolled capture: what is pinned to the
      // bottom of the screen (the thread's Reply bar on a phone) then sits at the bottom, not across the middle.
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width: viewport.width, height });
      await page.screenshot({ path: `docs/screenshots/${name}-${viewport.width}.png` });
    });
  }
}
