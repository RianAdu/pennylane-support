import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { expectNoAxeViolations } from "../../test-utils/axe";
import { rawConversation } from "../../test-utils/fixtures";
import { renderApp } from "../../test-utils/renderApp";
import { serve } from "../../test-utils/serve";

// jsdom applies no media queries, so the app renders as it does on a phone: the navigation is in the menu.
const openMenu = async (): Promise<HTMLElement> => {
  await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
  const menu = screen.getByRole("dialog", { name: "Menu" });
  // The categories arrive with the rest of the navigation, so the menu is complete once one shows.
  await within(menu).findByRole("link", { name: /PennyLane Help/ });
  return menu;
};

it("hides the Insights link from a learner", async () => {
  serve([rawConversation()]);
  renderApp("/", { role: "learner" });
  const menu = await openMenu();

  expect(within(menu).getByRole("link", { name: "Challenges" })).toBeInTheDocument();
  expect(within(menu).queryByRole("link", { name: "Insights" })).not.toBeInTheDocument();
  await expectNoAxeViolations(document.body);
});

it("tells a learner who opens the insights address that the page is for admins", async () => {
  serve([rawConversation()]);
  renderApp("/insights", { role: "learner" });

  expect(screen.getByRole("heading", { level: 1, name: "Insights are for admins" })).toBeInTheDocument();
  await expectNoAxeViolations(document.body);
});

it("shows an admin the Insights link", async () => {
  serve([rawConversation()]);
  renderApp("/", { role: "admin" });
  const menu = await openMenu();

  expect(within(menu).getByRole("link", { name: "Insights" })).toBeInTheDocument();
  await expectNoAxeViolations(document.body);
});

it("lists the challenge categories under Challenges, each a link to its row on the page", async () => {
  serve([rawConversation()]);
  renderApp("/challenges");
  await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
  const menu = screen.getByRole("dialog", { name: "Menu" });

  expect(await within(menu).findByRole("link", { name: "Getting Started" })).toHaveAttribute(
    "href",
    "/challenges#getting-started",
  );
  await expectNoAxeViolations(document.body);
});
