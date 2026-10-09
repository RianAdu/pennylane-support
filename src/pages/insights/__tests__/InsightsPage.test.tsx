import { screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { expectNoAxeViolations } from "../../../test-utils/axe";
import { rawChallenge, rawConversation, rawPost } from "../../../test-utils/fixtures";
import { renderApp } from "../../../test-utils/renderApp";
import { serve } from "../../../test-utils/serve";

const conversations = [
  rawConversation({ identifier: "a", challenge_id: "CHAL_VQE", created_at: "2024-01-10T10:00:00Z" }),
  rawConversation({ identifier: "b", challenge_id: "CHAL_VQE", created_at: "2024-02-10T10:00:00Z" }),
  rawConversation({
    identifier: "c",
    challenge_id: "CHAL_BELL",
    created_at: "2024-02-12T10:00:00Z",
    assigned_to: "community_mod",
  }),
  rawConversation({
    identifier: "d",
    challenge_id: "CHAL_BELL",
    created_at: "2024-02-20T10:00:00Z",
    status: "resolved",
    resolution_time_hours: 12.5,
    posts: [rawPost(), rawPost({ post_id: 2, user: "mentor", is_accepted_answer: true })],
  }),
];

const challenges = [
  rawChallenge({ challenge_id: "CHAL_VQE", title: "Ground States", completion_rate: 0.3 }),
  rawChallenge({ challenge_id: "CHAL_BELL", title: "Bell States", completion_rate: 0.8 }),
];

/** The figure and note of one tile, as one string. */
const tile = (label: string): string => {
  const group = screen.getByText(label).parentElement;
  return within(group as HTMLElement)
    .getAllByRole("definition")
    .map((definition) => definition.textContent)
    .join(" | ");
};

it("shows an admin the four figures, a summary of each section and where each challenge's questions are", async () => {
  serve(conversations, challenges);
  renderApp("/insights", { role: "admin" });

  await screen.findByRole("heading", { level: 2, name: "Where learners struggle" });

  expect(tile("Open conversations")).toBe("3 | of 4");
  expect(tile("Open and unassigned")).toBe("2 | need an owner");
  expect(tile("Median time to resolve")).toBe("12.5 h hours | resolved and closed");
  expect(tile("With an accepted answer")).toBe("25.0% | 1 of 4");

  expect(
    screen.getByText("Ground States leads with 2 open questions, and 30% of attempts complete it."),
  ).toBeInTheDocument();
  expect(screen.getByText("Busiest month: February 2024, with 3 new conversations.")).toBeInTheDocument();

  const ranking = screen.getByRole("list", { name: "Where learners struggle" });
  expect(within(ranking).getByRole("link", { name: "Ground States, 2 open, 30% completed" })).toHaveAttribute(
    "href",
    "/?challengeId=CHAL_VQE&tab=unanswered",
  );

  const table = screen.getByRole("table", { name: "New conversations per month", hidden: true });
  expect(within(table).getByRole("row", { name: "February 2024 3", hidden: true })).toBeInTheDocument();

  await expectNoAxeViolations(document.body);
});
