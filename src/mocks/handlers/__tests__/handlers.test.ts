import { expect, it } from "vitest";
import {
  ROLE_HEADER,
  type ChallengeDetail,
  type ChallengeGroups,
  type ConversationDetail,
  type ConversationSummary,
  type Meta,
  type Paged,
} from "../../../api/contract";
import { apiGet, apiSend } from "../../../api/http";
import { rawChallenge, rawConversation } from "../../../test-utils/fixtures";
import { serve } from "../../../test-utils/serve";

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

it("gives a learner a draft challenge, since its threads are visible", async () => {
  serve(conversations, [rawChallenge({ challenge_id: "CHAL_DRAFT", title: "Unreleased", status: "draft" })]);

  const challenge = await apiGet<ChallengeDetail>("/api/challenges/CHAL_DRAFT", "learner");

  expect(challenge).toMatchObject({ title: "Unreleased", status: "draft" });
});

it("gives draft challenges in the list to an admin who asks, and ignores a learner who asks", async () => {
  serve(conversations, [
    rawChallenge({ challenge_id: "CHAL_001", title: "Begin Here" }),
    rawChallenge({ challenge_id: "CHAL_DRAFT", title: "Unreleased", status: "draft" }),
  ]);
  const titles = async (role: "learner" | "admin") => {
    const { categories } = await apiGet<ChallengeGroups>("/api/challenges", role, { includeHidden: "true" });
    return categories.flatMap(({ challenges }) => challenges.map((challenge) => challenge.title));
  };

  expect(await titles("admin")).toEqual(["Begin Here", "Unreleased"]);
  expect(await titles("learner")).toEqual(["Begin Here"]);
});

it("answers 404 for a challenge that does not exist", async () => {
  serve(conversations);

  await expect(apiGet("/api/challenges/CHAL_MISSING", "learner")).rejects.toMatchObject({
    name: "ApiError",
    status: 404,
  });
});

it("refuses a learner the insights with 403 and gives them to an admin", async () => {
  serve(conversations);

  await expect(apiGet("/api/insights", "learner")).rejects.toMatchObject({ name: "ApiError", status: 403 });
  await expect(apiGet("/api/insights", "admin")).resolves.toMatchObject({ total: 2 });
});

it("leaves priority and assignee out of a learner's thread, and gives them to an admin", async () => {
  serve(conversations);

  const forLearner = await apiGet<ConversationDetail>("/api/conversations/urgent", "learner");
  const forAdmin = await apiGet<ConversationDetail>("/api/conversations/urgent", "admin");

  expect(forLearner).not.toHaveProperty("priority");
  expect(forLearner).not.toHaveProperty("assignee");
  expect(forAdmin).toMatchObject({ priority: "urgent", assignee: "community_mod" });
});

it("answers 404 for a thread that does not exist", async () => {
  serve(conversations);

  await expect(apiGet("/api/conversations/missing", "learner")).rejects.toMatchObject({ status: 404 });
});

it("refuses a learner's status change with 403 and leaves the status as it was", async () => {
  serve([rawConversation({ identifier: "thread", status: "open" })]);

  await expect(apiSend("PATCH", "/api/conversations/thread", "learner", { status: "closed" })).rejects.toMatchObject({
    name: "ApiError",
    status: 403,
  });

  expect(await apiGet<ConversationDetail>("/api/conversations/thread", "learner")).toMatchObject({ status: "open" });
});

it("takes a status from an admin and nothing else", async () => {
  serve([rawConversation({ identifier: "thread", status: "open", is_locked: false })]);

  await expect(
    apiSend("PATCH", "/api/conversations/thread", "admin", { status: "closed", locked: true }),
  ).rejects.toMatchObject({ status: 400 });
  const changed = await apiSend<ConversationDetail>("PATCH", "/api/conversations/thread", "admin", {
    status: "closed",
  });

  expect(changed).toMatchObject({ status: "closed", locked: false });
});

it("refuses a reply to a locked thread with 409", async () => {
  serve([rawConversation({ identifier: "thread", is_locked: true })]);

  await expect(
    apiSend("POST", "/api/conversations/thread/posts", "admin", { content: "One more thing." }),
  ).rejects.toMatchObject({ status: 409 });
});

it("refuses an empty reply with 400", async () => {
  serve([rawConversation({ identifier: "thread" })]);

  await expect(apiSend("POST", "/api/conversations/thread/posts", "learner", { content: " " })).rejects.toMatchObject({
    status: 400,
  });
});
