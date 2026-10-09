import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { expectNoAxeViolations } from "../../../test-utils/axe";
import { rawConversation } from "../../../test-utils/fixtures";
import { renderApp } from "../../../test-utils/renderApp";
import { serve } from "../../../test-utils/serve";

const questions = (): HTMLElement => screen.getByRole("list", { name: "Questions" });

const expectQuestions = async (titles: string[]): Promise<void> => {
  await waitFor(() => {
    const shown = within(questions())
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(shown.sort()).toEqual([...titles].sort());
  });
};

// jsdom applies no media queries, so the app renders as it does on a phone: the navigation is in the menu.
const openMenu = async (): Promise<HTMLElement> => {
  await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
  return screen.getByRole("dialog", { name: "Menu" });
};

it("narrows the list by category, then tab, then search, and says how many are left", async () => {
  serve([
    rawConversation({ identifier: "a", topic: "Gradient is zero", category: "Demos", status: "open" }),
    rawConversation({ identifier: "b", topic: "Barren plateau", category: "Demos", status: "resolved" }),
    rawConversation({ identifier: "c", topic: "Shot noise", category: "Catalyst", status: "open" }),
    rawConversation({ identifier: "d", topic: "Gradient mismatch", category: "Demos", status: "open" }),
  ]);
  renderApp("/");
  await expectQuestions(["Gradient is zero", "Barren plateau", "Shot noise", "Gradient mismatch"]);
  expect(screen.getByRole("status")).toHaveTextContent("4 questions");

  const menu = await openMenu();
  await userEvent.click(await within(menu).findByRole("link", { name: /Demos/ }));
  await expectQuestions(["Gradient is zero", "Barren plateau", "Gradient mismatch"]);
  expect(screen.getByRole("heading", { level: 1, name: "Demos" })).toBeInTheDocument();

  await userEvent.click(screen.getByRole("tab", { name: "Unanswered" }));
  await expectQuestions(["Gradient is zero", "Gradient mismatch"]);

  await userEvent.type(screen.getByRole("searchbox", { name: "Search questions" }), "mismatch");
  await expectQuestions(["Gradient mismatch"]);
  expect(screen.getByRole("status")).toHaveTextContent("1 result for “mismatch”");
  expect(screen.getByRole("tab", { name: "Unanswered" })).toHaveAttribute("aria-selected", "true");
  await expectNoAxeViolations(document.body);
});

it("keeps Needs attention for the admin and returns a learner to Latest", async () => {
  serve([
    rawConversation({ identifier: "a", topic: "Nobody owns this", status: "open", assigned_to: null }),
    rawConversation({ identifier: "b", topic: "In hand", status: "open", priority: "low", assigned_to: "mod" }),
  ]);
  renderApp("/?tab=attention", { role: "admin" });
  await expectQuestions(["Nobody owns this"]);
  expect(screen.getByRole("tab", { name: "Needs attention" })).toHaveAttribute("aria-selected", "true");
  expect(within(questions()).getByText("Unassigned")).toBeInTheDocument();

  const menu = await openMenu();
  await userEvent.click(within(menu).getByRole("button", { name: "Viewing as: Admin" }));
  await userEvent.click(screen.getByRole("menuitemradio", { name: "Learner" }));
  await userEvent.click(within(menu).getByRole("button", { name: "Close menu" }));

  await expectQuestions(["Nobody owns this", "In hand"]);
  expect(screen.queryByRole("tab", { name: "Needs attention" })).not.toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Latest" })).toHaveAttribute("aria-selected", "true");
  expect(within(questions()).queryByText("Unassigned")).not.toBeInTheDocument();
  await expectNoAxeViolations(document.body);
});
