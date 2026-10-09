import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { expectNoAxeViolations } from "../../../test-utils/axe";
import { rawChallenge, rawConversation } from "../../../test-utils/fixtures";
import { renderApp } from "../../../test-utils/renderApp";
import { serve } from "../../../test-utils/serve";

const conversations = [
  rawConversation({ identifier: "a", topic: "Why is my gradient zero?", challenge_id: "CHAL_GRAD" }),
  rawConversation({ identifier: "b", topic: "Wrong expectation value", challenge_id: "CHAL_BEGIN" }),
];

const challenges = [
  rawChallenge({ challenge_id: "CHAL_BEGIN", title: "Begin Here", category: "Getting Started" }),
  rawChallenge({ challenge_id: "CHAL_GRAD", title: "Gradients", category: "Optimization", difficulty: "Advanced" }),
  rawChallenge({ challenge_id: "CHAL_DRAFT", title: "Unreleased", category: "Optimization", status: "draft" }),
];

it("shows a row of cards per category, and a card opens the questions about its challenge", async () => {
  serve(conversations, challenges);
  renderApp("/challenges");

  const optimization = await screen.findByRole("list", { name: "Optimization" });
  expect(screen.getByRole("list", { name: "Getting Started" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Scroll Optimization forward" })).toBeInTheDocument();

  const cards = within(optimization).getAllByRole("link");
  expect(cards).toHaveLength(1);
  expect(cards[0]).toHaveAccessibleName("Gradients Advanced A first circuit. 1 open question");
  await expectNoAxeViolations(document.body);

  await userEvent.click(cards[0] as HTMLElement);

  expect(await screen.findByRole("button", { name: /^Challenge: Gradients\s*, remove filter$/ })).toBeInTheDocument();
  const questions = await screen.findByRole("list", { name: "Questions" });
  expect(within(questions).getAllByRole("link")).toHaveLength(1);
  expect(within(questions).getByRole("link", { name: /Why is my gradient zero\?/ })).toBeInTheDocument();
});
