import { describe, expect, it } from "vitest";
import type { RawConversation } from "../../../domain/types";
import { rawChallenge, rawConversation, rawPost } from "../../../test-utils/fixtures";
import { createStore } from "../../db/store";
import { listConversations } from "../listConversations";
import { parseListParams, type ListParams } from "../parseListParams";

const storeOf = (conversations: RawConversation[]) => {
  return createStore(conversations, [rawChallenge({ challenge_id: "CHAL_001" })]);
};

const list = (conversations: RawConversation[], params: Partial<ListParams> = {}, includeTriage = false) => {
  const all = { ...parseListParams(new URLSearchParams()), ...params };
  return listConversations(storeOf(conversations), all, { includeTriage });
};

const ids = (conversations: RawConversation[], params: Partial<ListParams> = {}) => {
  return list(conversations, params).items.map((item) => item.id);
};

const onePerStatus = ["open", "answered", "resolved", "closed"].map((status) => {
  return rawConversation({ identifier: status, status });
});

describe("tabs", () => {
  it("keeps only open threads under Unanswered", () => {
    expect(ids(onePerStatus, { tab: "unanswered" })).toEqual(["open"]);
  });

  it("keeps only resolved threads under Solved", () => {
    expect(ids(onePerStatus, { tab: "solved" })).toEqual(["resolved"]);
  });

  it("keeps open threads that are unassigned, high or urgent under Needs attention", () => {
    const conversations = [
      rawConversation({ identifier: "unassigned", assigned_to: null, priority: "low" }),
      rawConversation({ identifier: "high", assigned_to: "community_mod", priority: "high" }),
      rawConversation({ identifier: "urgent", assigned_to: "community_mod", priority: "urgent" }),
      rawConversation({ identifier: "assigned-medium", assigned_to: "community_mod", priority: "medium" }),
      rawConversation({ identifier: "resolved-urgent", status: "resolved", assigned_to: null, priority: "urgent" }),
    ];

    expect(ids(conversations, { tab: "attention" }).sort()).toEqual(["high", "unassigned", "urgent"]);
  });
});

describe("search", () => {
  const conversations = [
    rawConversation({ identifier: "in-title", topic: "Gradient is zero", description: "Nothing moves." }),
    rawConversation({ identifier: "in-description", topic: "Stuck", description: "The Gradient vanishes." }),
    rawConversation({ identifier: "neither", topic: "Stuck", description: "Device error." }),
  ];

  it("matches the title and the description whatever the case", () => {
    expect(ids(conversations, { q: "gradient" }).sort()).toEqual(["in-description", "in-title"]);
  });
});

describe("filters", () => {
  const match = rawConversation({
    identifier: "match",
    category: "Catalyst",
    challenge_id: "CHAL_001",
    tags: ["gpu", "qnode"],
    priority: "urgent",
    assigned_to: "lightning_dev",
  });
  const unassigned = rawConversation({ identifier: "unassigned", challenge_id: "CHAL_002", tags: [] });
  const conversations = [match, unassigned];

  it.each([
    { name: "category", params: { category: "Catalyst" }, expected: ["match"] },
    { name: "challenge", params: { challengeId: "CHAL_001" }, expected: ["match"] },
    { name: "tag", params: { tag: "qnode" }, expected: ["match"] },
    { name: "priority", params: { priority: "urgent" }, expected: ["match"] },
    { name: "assignee", params: { assignee: "lightning_dev" }, expected: ["match"] },
    { name: "no assignee", params: { assignee: "unassigned" }, expected: ["unassigned"] },
  ] satisfies { name: string; params: Partial<ListParams>; expected: string[] }[])(
    "filters by $name",
    ({ params, expected }) => {
      expect(ids(conversations, params)).toEqual(expected);
    },
  );

  it("applies the tab, a filter and the search together", () => {
    const candidates = [
      rawConversation({ identifier: "all-three", topic: "Gradient", category: "Catalyst" }),
      rawConversation({ identifier: "wrong-tab", topic: "Gradient", category: "Catalyst", status: "closed" }),
      rawConversation({ identifier: "wrong-category", topic: "Gradient", category: "Demos" }),
      rawConversation({ identifier: "wrong-words", topic: "Device", category: "Catalyst" }),
    ];

    expect(ids(candidates, { tab: "unanswered", category: "Catalyst", q: "gradient" })).toEqual(["all-three"]);
  });
});

describe("order and paging", () => {
  const postedAt = (identifier: string, timestamp: string) => {
    return rawConversation({ identifier, posts: [rawPost({ timestamp })] });
  };

  it("orders by latest activity, newest first, and breaks ties by id", () => {
    const conversations = [
      postedAt("old", "2024-03-01T10:00:00Z"),
      postedAt("tie-b", "2024-03-02T10:00:00Z"),
      postedAt("new", "2024-03-03T10:00:00Z"),
      postedAt("tie-a", "2024-03-02T10:00:00Z"),
    ];

    expect(ids(conversations)).toEqual(["new", "tie-a", "tie-b", "old"]);
  });

  const five = [1, 2, 3, 4, 5].map((day) => postedAt(`day-${day}`, `2024-03-0${day}T10:00:00Z`));

  it("returns the requested page with the total of all matches", () => {
    const page = list(five, { page: 2, pageSize: 2 });

    expect(page.items.map((item) => item.id)).toEqual(["day-3", "day-2"]);
    expect(page).toMatchObject({ page: 2, pageSize: 2, total: 5 });
  });

  it("returns no items and the real total for a page past the end", () => {
    expect(list(five, { page: 9, pageSize: 2 })).toMatchObject({ items: [], total: 5 });
  });
});

describe("list items", () => {
  it("hides priority and assignee from learners", () => {
    const [item] = list([rawConversation()]).items;

    expect(item).not.toHaveProperty("priority");
    expect(item).not.toHaveProperty("assignee");
  });

  it("gives an admin the priority and the assignee, unassigned included", () => {
    const [item] = list([rawConversation({ priority: "high", assigned_to: null })], {}, true).items;

    expect(item).toMatchObject({ priority: "high", assignee: null });
  });

  it("describes the thread by its opening post, not by its replies", () => {
    const conversation = rawConversation({
      posts: [
        rawPost({ post_id: 2, user: "mentor", user_role: "mentor", content: "Try a seed.", is_accepted_answer: true }),
        rawPost({
          post_id: 1,
          user: "asker",
          content: "My circuit returns NaN.",
          reactions: { upvotes: 7, helpful: 0 },
        }),
        rawPost({ post_id: 3, user: "asker", content: "Thanks!", reactions: { upvotes: 2, helpful: 0 } }),
      ],
    });

    expect(list([conversation]).items[0]).toMatchObject({
      author: "asker",
      excerpt: "My circuit returns NaN.",
      votes: 7,
      replyCount: 2,
      hasAcceptedAnswer: true,
    });
  });

  it("cuts a long excerpt at a whole word and ends it with an ellipsis", () => {
    const content = "measure ".repeat(40).trim();
    const [item] = list([rawConversation({ posts: [rawPost({ content })] })]).items;

    expect(item?.excerpt).toBe(`${"measure ".repeat(25).trim()}…`);
  });

  it("names the challenge and its category", () => {
    const store = createStore(
      [rawConversation({ challenge_id: "CHAL_002" })],
      [
        rawChallenge({ challenge_id: "CHAL_001", title: "Begin Here", category: "Getting Started" }),
        rawChallenge({ challenge_id: "CHAL_002", title: "Begin Here", category: "Gradients" }),
      ],
    );
    const page = listConversations(store, parseListParams(new URLSearchParams()), { includeTriage: false });

    expect(page.items[0]).toMatchObject({ challengeTitle: "Begin Here", challengeCategory: "Gradients" });
  });
});
