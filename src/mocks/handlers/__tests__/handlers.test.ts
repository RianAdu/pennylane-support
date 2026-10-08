import { expect, it } from "vitest";
import { ROLE_HEADER, type ConversationSummary, type Meta, type Paged } from "../../../api/contract";
import { apiGet } from "../../../api/http";
import { rawConversation } from "../../../test/fixtures";
import { serve } from "../../../test/serve";

const conversations = [
  rawConversation({ identifier: "urgent", priority: "urgent", assigned_to: "community_mod" }),
  rawConversation({ identifier: "low", priority: "low", assigned_to: null }),
];

const list = (role: "learner" | "admin", query: Record<string, string> = {}) => {
  return apiGet<Paged<ConversationSummary>>("/api/conversations", role, query);
};

it("refuses the Needs attention tab for a learner", async () => {
  serve(conversations);

  await expect(list("learner", { tab: "attention" })).rejects.toMatchObject({ name: "ApiError", status: 403 });
});

it("leaves priority and assignee out of a learner's rows", async () => {
  serve(conversations);

  const { items } = await list("learner");

  expect(items).toHaveLength(2);
  for (const item of items) {
    expect(item).not.toHaveProperty("priority");
    expect(item).not.toHaveProperty("assignee");
  }
});

it("gives an admin the priority and assignee of each row", async () => {
  serve(conversations);

  const { items } = await list("admin");

  expect(items.map(({ id, priority, assignee }) => ({ id, priority, assignee }))).toEqual(
    expect.arrayContaining([
      { id: "urgent", priority: "urgent", assignee: "community_mod" },
      { id: "low", priority: "low", assignee: null },
    ]),
  );
});

it("ignores a learner's priority and assignee filters", async () => {
  serve(conversations);

  const byPriority = await list("learner", { priority: "urgent" });
  const byAssignee = await list("learner", { assignee: "community_mod" });

  expect(byPriority.total).toBe(2);
  expect(byAssignee.total).toBe(2);
});

it("gives the assignees in meta to an admin only", async () => {
  serve(conversations);

  const forAdmin = await apiGet<Meta>("/api/meta", "admin");
  const forLearner = await apiGet<Meta>("/api/meta", "learner");

  expect(forAdmin.assignees).toEqual(["community_mod"]);
  expect(forLearner).not.toHaveProperty("assignees");
});

it("treats a request without a known role as a learner", async () => {
  serve(conversations);

  const withoutRole = await fetch("/api/meta");
  const withUnknownRole = await fetch("/api/meta", { headers: { [ROLE_HEADER]: "root" } });

  expect(await withoutRole.json()).not.toHaveProperty("assignees");
  expect(await withUnknownRole.json()).not.toHaveProperty("assignees");
});
