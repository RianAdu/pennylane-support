import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { expectNoAxeViolations } from "../../../test-utils/axe";
import { rawConversation, rawPost } from "../../../test-utils/fixtures";
import { renderApp } from "../../../test-utils/renderApp";
import { serve } from "../../../test-utils/serve";

const TITLE = "Unexpected NaNs when measuring";

const main = (): HTMLElement => screen.getByRole("main");
const question = (): Promise<HTMLElement> => screen.findByRole("heading", { level: 1, name: `Question: ${TITLE}` });

it("posts a reply and shows it in the thread", async () => {
  serve([rawConversation({ identifier: "t1" })]);
  renderApp("/threads/t1");
  await question();
  expect(screen.getByRole("heading", { level: 2, name: "No replies yet" })).toBeInTheDocument();

  await userEvent.type(screen.getByRole("textbox", { name: "Your reply" }), "Check the shot count.");
  await userEvent.click(screen.getByRole("button", { name: "Post reply" }));

  const reply = await screen.findByRole("article", { name: "Reply by you" });
  expect(within(reply).getByText("Check the shot count.")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "1 reply" })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Your reply" })).toHaveValue("");
  await expectNoAxeViolations(document.body);
});

it("explains that a locked thread takes no replies, and offers no form", async () => {
  serve([rawConversation({ identifier: "t1", status: "closed", is_locked: true })]);
  renderApp("/threads/t1");
  await question();

  expect(screen.getByRole("heading", { level: 2, name: "This thread is locked" })).toBeInTheDocument();
  expect(screen.queryByRole("textbox", { name: "Your reply" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /reply/i })).not.toBeInTheDocument();
  await expectNoAxeViolations(document.body);
});

it("shows a learner no way to manage the thread", async () => {
  serve([rawConversation({ identifier: "t1" })]);
  renderApp("/threads/t1", { role: "learner" });
  await question();

  expect(screen.queryByRole("button", { name: "Manage thread" })).not.toBeInTheDocument();
});

it("lets an admin change the status, and shows the new status", async () => {
  serve([rawConversation({ identifier: "t1", status: "open" })]);
  renderApp("/threads/t1", { role: "admin" });
  await question();
  expect(within(main()).getByText("Open")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Manage thread" }));
  await userEvent.click(screen.getByRole("menuitemradio", { name: "Closed" }));

  await waitFor(() => {
    expect(within(main()).getByText("Closed")).toBeInTheDocument();
  });
  expect(within(main()).queryByText("Open")).not.toBeInTheDocument();
  await expectNoAxeViolations(document.body);
});

it("puts the accepted answer right after the question, even when another reply is dated earlier", async () => {
  serve([
    rawConversation({
      identifier: "t1",
      status: "resolved",
      posts: [
        rawPost({ post_id: 1, user: "asker", timestamp: "2024-03-01T10:00:00Z" }),
        rawPost({ post_id: 2, user: "early_bird", timestamp: "2024-03-01T09:00:00Z", content: "Same here." }),
        rawPost({
          post_id: 3,
          user: "helper",
          user_role: "mentor",
          timestamp: "2024-03-01T11:00:00Z",
          content: "Raise the shot count.",
          is_accepted_answer: true,
        }),
      ],
    }),
  ]);
  renderApp("/threads/t1");
  const title = await question();

  const answer = screen.getByRole("region", { name: "Accepted answer" });
  const earlier = screen.getByRole("article", { name: "Reply by early_bird" });
  expect(within(answer).getByText("Raise the shot count.")).toBeInTheDocument();
  expect(within(answer).getByText("Mentor")).toBeInTheDocument();
  expect(title.compareDocumentPosition(answer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(answer.compareDocumentPosition(earlier) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getByRole("heading", { level: 2, name: "1 more reply" })).toBeInTheDocument();
});
