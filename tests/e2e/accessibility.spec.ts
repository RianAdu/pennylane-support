import { test } from "@playwright/test";
import { asRole, expectNoAxeViolations, openPage, THREAD_PATH, type Role } from "./support";

const ROLES: Role[] = ["learner", "admin"];
// A learner's Insights is the "for admins" state, which is a page of its own.
const PAGES = [
  { name: "the Community list", path: "/" },
  { name: "a thread", path: THREAD_PATH },
  { name: "the Challenges page", path: "/challenges" },
  { name: "the Insights page", path: "/insights" },
];

for (const role of ROLES) {
  for (const { name, path } of PAGES) {
    test(`${name} has no accessibility violations for ${role === "admin" ? "an admin" : "a learner"}`, async ({
      page,
    }) => {
      await asRole(page, role);
      await openPage(page, path);
      await expectNoAxeViolations(page);
    });
  }
}
