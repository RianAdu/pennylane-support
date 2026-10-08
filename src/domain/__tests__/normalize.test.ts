import { describe, expect, it } from "vitest";
import challengesFile from "../../../data/pennylane_coding_challenges.json";
import conversationsFile from "../../../data/pennylane_support_conversations.json";
import {
  isSolvedByAsker,
  normalizeChallenge,
  normalizeConversation,
  orderPosts,
  stripDescriptionMetadata,
} from "../normalize";
import type { RawChallenge, RawConversation, RawPost } from "../types";

const rawPost = (overrides: Partial<RawPost> = {}): RawPost => {
  return {
    post_id: 1,
    user: "asker",
    timestamp: "2024-03-01T10:00:00Z",
    content: "My circuit returns NaN.",
    user_role: "learner",
    reactions: { upvotes: 3, helpful: 1 },
    is_accepted_answer: false,
    ...overrides,
  };
};

const rawConversation = (overrides: Partial<RawConversation> = {}): RawConversation => {
  return {
    identifier: "CONV_TEST",
    topic: "Unexpected NaNs when measuring",
    category: "PennyLane Help",
    posts: [rawPost()],
    challenge_id: "CHAL_001",
    status: "open",
    priority: "medium",
    tags: ["debugging"],
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-03-01T10:00:00Z",
    last_activity_at: "2024-03-01T10:00:00Z",
    participant_count: 1,
    participants: ["asker"],
    view_count: 10,
    is_pinned: false,
    is_locked: false,
    assigned_to: null,
    resolution_time_hours: null,
    description: "My circuit returns NaN.",
    ...overrides,
  };
};

const rawChallenge = (overrides: Partial<RawChallenge> = {}): RawChallenge => {
  return {
    challenge_id: "CHAL_TEST",
    title: "Begin Here",
    description: "A first circuit.",
    category: "Getting Started",
    difficulty: "Beginner",
    points: 50,
    tags: [],
    learning_objectives: [],
    hints: [],
    status: "published",
    estimated_minutes: 30,
    completion_rate: 0.5,
    attempt_count: 10,
    average_attempts_to_pass: 1.5,
    created_at: "2023-06-04T20:00:00Z",
    updated_at: "2023-06-18T20:00:00Z",
    author: "pennylane_team",
    prerequisite_challenge_ids: [],
    ...overrides,
  };
};

const postIds = (posts: readonly { post_id: number }[]) => posts.map((post) => post.post_id);

describe("post order", () => {
  it("keeps post_id 1 as the opening post even when a reply has an earlier timestamp", () => {
    const posts = [
      rawPost({ post_id: 1, timestamp: "2024-03-01T10:00:00Z" }),
      rawPost({ post_id: 2, timestamp: "2024-03-01T09:00:00Z" }),
    ];

    expect(postIds(orderPosts(posts))).toEqual([1, 2]);
  });

  it("sorts the replies by timestamp", () => {
    const posts = [
      rawPost({ post_id: 1, timestamp: "2024-03-01T10:00:00Z" }),
      rawPost({ post_id: 2, timestamp: "2024-03-01T14:00:00Z" }),
      rawPost({ post_id: 3, timestamp: "2024-03-01T11:00:00Z" }),
      rawPost({ post_id: 4, timestamp: "2024-03-01T12:00:00Z" }),
    ];

    expect(postIds(orderPosts(posts))).toEqual([1, 3, 4, 2]);
  });

  it("breaks a timestamp tie by post_id", () => {
    const posts = [
      rawPost({ post_id: 1, timestamp: "2024-03-01T10:00:00Z" }),
      rawPost({ post_id: 3, timestamp: "2024-03-01T11:00:00Z" }),
      rawPost({ post_id: 2, timestamp: "2024-03-01T11:00:00Z" }),
    ];

    expect(postIds(orderPosts(posts))).toEqual([1, 2, 3]);
  });

  it("does not reorder the raw posts in place", () => {
    const posts = [rawPost({ post_id: 2, timestamp: "2024-03-01T09:00:00Z" }), rawPost({ post_id: 1 })];

    orderPosts(posts);

    expect(postIds(posts)).toEqual([2, 1]);
  });
});

describe("normalizeConversation", () => {
  const outOfOrder = rawConversation({
    created_at: "2024-03-01T10:00:00Z",
    last_activity_at: "2024-03-01T09:00:00Z",
    posts: [
      rawPost({ post_id: 1, user: "asker", timestamp: "2024-03-01T10:00:00Z", content: "The question." }),
      rawPost({ post_id: 2, user: "helper", timestamp: "2024-03-02T08:00:00Z", user_role: "mentor" }),
      rawPost({ post_id: 3, user: "helper", timestamp: "2024-03-01T09:00:00Z", user_role: "staff" }),
    ],
  });

  it("derives the opening post, the description fallback and the last activity in the documented order", () => {
    const conversation = normalizeConversation({ ...outOfOrder, description: undefined });

    expect(conversation.posts.map((post) => post.postId)).toEqual([1, 3, 2]);
    expect(conversation.description).toBe("The question.");
    expect(conversation.createdAt).toBe("2024-03-01T10:00:00Z");
    expect(conversation.lastActivityAt).toBe("2024-03-02T08:00:00Z");
  });

  it("recomputes the last activity from the latest post, not the last one in the file", () => {
    expect(normalizeConversation(outOfOrder).lastActivityAt).toBe("2024-03-02T08:00:00Z");
  });

  it("keeps the role per post and never merges a user's roles", () => {
    const conversation = normalizeConversation(outOfOrder);

    expect(conversation.posts.map((post) => [post.author, post.roleAtPosting])).toEqual([
      ["asker", "learner"],
      ["helper", "staff"],
      ["helper", "mentor"],
    ]);
  });

  it("falls back to the opening post when the description is missing", () => {
    const raw = rawConversation({ posts: [rawPost({ content: "Opening words." })] });
    delete raw.description;

    expect(normalizeConversation(raw).description).toBe("Opening words.");
  });

  it("keeps status answered when there is no accepted answer", () => {
    const conversation = normalizeConversation(rawConversation({ status: "answered" }));

    expect(conversation.status).toBe("answered");
    expect(conversation.acceptedPostId).toBeNull();
  });

  it("records the accepted answer by post id", () => {
    const conversation = normalizeConversation(
      rawConversation({
        posts: [rawPost({ post_id: 1 }), rawPost({ post_id: 2, user: "helper", is_accepted_answer: true })],
      }),
    );

    expect(conversation.acceptedPostId).toBe(2);
  });

  it("keeps a null assignee as unassigned", () => {
    expect(normalizeConversation(rawConversation({ assigned_to: null })).assignee).toBeNull();
    expect(normalizeConversation(rawConversation({ assigned_to: "community_mod" })).assignee).toBe("community_mod");
  });

  it("keeps a missing resolution time as null", () => {
    expect(normalizeConversation(rawConversation({ resolution_time_hours: null })).resolutionTimeHours).toBeNull();
  });

  it("refuses a status the app does not know", () => {
    expect(() => normalizeConversation(rawConversation({ status: "pending" }))).toThrow(/status/);
  });
});

describe("isSolvedByAsker", () => {
  const thread = (acceptedAuthor: string | null) =>
    normalizeConversation(
      rawConversation({
        posts: [
          rawPost({ post_id: 1, user: "asker" }),
          rawPost({ post_id: 2, user: "helper", is_accepted_answer: acceptedAuthor === "helper" }),
          rawPost({ post_id: 3, user: "asker", is_accepted_answer: acceptedAuthor === "asker" }),
        ],
      }),
    );

  it("is true when the asker wrote the accepted answer", () => {
    expect(isSolvedByAsker(thread("asker"))).toBe(true);
  });

  it("is false when someone else wrote it, or nothing is accepted", () => {
    expect(isSolvedByAsker(thread("helper"))).toBe(false);
    expect(isSolvedByAsker(thread(null))).toBe(false);
  });
});

describe("stripDescriptionMetadata", () => {
  const topic = "Error with qml.QNode decorator on custom device";

  it("removes the inline status, priority and challenge line and the heading it leaves empty", () => {
    const description = [
      "## Issue summary",
      "",
      topic,
      "",
      "**Status:** `resolved` · **Priority:** `high` · **Challenge:** `CHAL_024`",
      "",
      "### Context",
      "Getting a strange error.",
    ].join("\n");

    expect(stripDescriptionMetadata(description, topic)).toBe("### Context\nGetting a strange error.");
  });

  it("removes the triage table with its heading and keeps the text around it", () => {
    const description = [
      "## Support request",
      "",
      topic,
      "",
      "Why this angle?",
      "",
      "#### Triage notes",
      "| Field | Value |",
      "| --- | --- |",
      "| Category | Demos |",
      "| Status | `closed` |",
      "| Priority | `medium` |",
      "",
      "Please reply with PennyLane version + device name if escalating.",
    ].join("\n");

    expect(stripDescriptionMetadata(description, topic)).toBe(
      "## Support request\n\nWhy this angle?\n\nPlease reply with PennyLane version + device name if escalating.",
    );
  });

  it("removes the topic, category and challenge lines and the code fence left empty", () => {
    const description = [
      "Is there a way?",
      "",
      "---",
      "",
      `**Topic:** ${topic}`,
      "",
      "Checklist for responders:",
      "- [ ] Confirm challenge context (`CHAL_007`)",
      "- [ ] Ask for MRE if missing",
      "",
      "```text",
      "Thread category: Catalyst",
      "```",
    ].join("\n");

    expect(stripDescriptionMetadata(description, topic)).toBe(
      "Is there a way?\n\n---\n\nChecklist for responders:\n- [ ] Ask for MRE if missing",
    );
  });

  it("removes the related challenge, original topic and tags lines", () => {
    const description = [
      "### Conversation brief",
      "",
      "Hi everyone!",
      "",
      "Related challenge: **CHAL_011**",
      "",
      `> Original topic: ${topic}`,
      "",
      "Tags: `lightning`, `chemistry`",
    ].join("\n");

    expect(stripDescriptionMetadata(description, topic)).toBe("### Conversation brief\n\nHi everyone!");
  });

  it("keeps a code fence that has content, and does not read a # comment in it as a heading", () => {
    const description = ["### Sketch", "", "```python", "# minimal sketch from the thread", "```"].join("\n");

    expect(stripDescriptionMetadata(description, topic)).toBe(description);
  });

  it("leaves a description without metadata as it is", () => {
    expect(stripDescriptionMetadata("Plain question about gradients.", topic)).toBe("Plain question about gradients.");
  });

  it("leaves an internal ID that the asker typed in a sentence", () => {
    const sentence = 'Working on CHAL_004 "States and Probabilities" and my probabilities are off.';

    expect(stripDescriptionMetadata(sentence, topic)).toBe(sentence);
  });
});

describe("normalizeChallenge", () => {
  it("converts points stored as a string to a number", () => {
    expect(normalizeChallenge(rawChallenge({ points: "225" })).points).toBe(225);
    expect(normalizeChallenge(rawChallenge({ points: 50 })).points).toBe(50);
  });

  it("refuses points that are not a number", () => {
    expect(() => normalizeChallenge(rawChallenge({ points: "lots" }))).toThrow(/points/);
  });

  it("keeps the status, so drafts and archived challenges can be hidden and labelled", () => {
    expect(normalizeChallenge(rawChallenge({ status: "draft" })).status).toBe("draft");
    expect(normalizeChallenge(rawChallenge({ status: "archived" })).status).toBe("archived");
  });
});

// The counts the documents quote, pinned against the real files so a wrong claim fails a test.
describe("the brief's data", () => {
  const rawConversations: RawConversation[] = conversationsFile.support_conversations;
  const rawChallenges: RawChallenge[] = challengesFile.coding_challenges;
  const conversations = rawConversations.map(normalizeConversation);
  const challenges = rawChallenges.map(normalizeChallenge);
  const time = (iso: string) => Date.parse(iso);
  const count = <T>(items: readonly T[], test: (item: T) => boolean) => items.filter(test).length;
  const withDescription = rawConversations.filter((raw) => raw.description !== undefined);
  const stripped = withDescription.map((raw) => ({
    topic: raw.topic,
    before: raw.description ?? "",
    after: stripDescriptionMetadata(raw.description ?? "", raw.topic),
  }));

  it("holds 120 challenges, 800 conversations and 3,061 posts, keyed on unique IDs", () => {
    expect(challenges).toHaveLength(120);
    expect(conversations).toHaveLength(800);
    expect(conversations.flatMap((conversation) => conversation.posts)).toHaveLength(3061);
    expect(new Set(conversations.map((conversation) => conversation.id)).size).toBe(800);
    expect(new Set(challenges.map((challenge) => challenge.id)).size).toBe(120);
  });

  it("has posts out of time order in 449 conversations and shared timestamps in 8", () => {
    const outOfOrder = count(rawConversations, (raw) =>
      raw.posts.some((post, index) => index > 0 && time(post.timestamp) < time(raw.posts[index - 1]?.timestamp ?? "")),
    );
    const withTies = count(
      rawConversations,
      (raw) => new Set(raw.posts.map((post) => post.timestamp)).size < raw.posts.length,
    );

    expect(outOfOrder).toBe(449);
    expect(withTies).toBe(8);
  });

  it("always opens with post_id 1, whose timestamp is created_at, in all 800 conversations", () => {
    expect(count(conversations, (conversation) => conversation.posts[0]?.postId === 1)).toBe(800);
    expect(count(conversations, (conversation) => conversation.posts[0]?.postedAt === conversation.createdAt)).toBe(
      800,
    );
  });

  it("has a reply dated before the question in 220 conversations", () => {
    const early = count(conversations, (conversation) =>
      conversation.posts.some((post) => time(post.postedAt) < time(conversation.createdAt)),
    );

    expect(early).toBe(220);
  });

  it("orders the replies of every conversation by time, then post id", () => {
    for (const conversation of conversations) {
      const replies = conversation.posts.slice(1);
      replies.forEach((reply, index) => {
        const previous = replies[index - 1];
        if (previous === undefined) return;
        const gap = time(reply.postedAt) - time(previous.postedAt);
        expect(gap > 0 || (gap === 0 && reply.postId > previous.postId)).toBe(true);
      });
    }
  });

  it("corrects the last activity of 267 conversations and never moves it earlier", () => {
    const corrected = rawConversations.filter(
      (raw, index) => raw.last_activity_at !== conversations[index]?.lastActivityAt,
    );

    expect(corrected).toHaveLength(267);
    for (const [index, raw] of rawConversations.entries()) {
      expect(time(conversations[index]?.lastActivityAt ?? "")).toBeGreaterThanOrEqual(time(raw.last_activity_at));
    }
  });

  it("has 20 users who posted under more than one role", () => {
    const rolesByUser = new Map<string, Set<string>>();
    for (const post of conversations.flatMap((conversation) => conversation.posts)) {
      rolesByUser.set(post.author, (rolesByUser.get(post.author) ?? new Set()).add(post.roleAtPosting));
    }

    expect(count([...rolesByUser.values()], (roles) => roles.size > 1)).toBe(20);
  });

  it("falls back to the opening post for the 60 conversations without a description", () => {
    const missing = rawConversations.filter((raw) => raw.description === undefined);

    expect(missing).toHaveLength(60);
    for (const raw of missing) {
      const conversation = normalizeConversation(raw);
      expect(conversation.description).toBe(conversation.posts[0]?.content);
    }
  });

  it("strips status and priority from 333 descriptions: 170 inline and 163 in a triage table", () => {
    expect(count(stripped, ({ before }) => /^\*\*Status:\*\*.*\*\*Priority:\*\*/m.test(before))).toBe(170);
    expect(count(stripped, ({ before }) => /^\| Priority \|/m.test(before))).toBe(163);
    expect(count(stripped, ({ before }) => /\b(status|priority)\b/i.test(before))).toBe(333);
    expect(count(stripped, ({ after }) => /\b(status|priority|category)\b/i.test(after))).toBe(0);
  });

  it("leaves no priority value a learner could search for", () => {
    expect(count(stripped, ({ before }) => /urgent/i.test(before))).toBe(22);
    expect(count(conversations, (conversation) => /urgent/i.test(conversation.description))).toBe(0);
  });

  it("strips the internal ID from 521 descriptions, leaving only the 9 where the asker typed it", () => {
    expect(count(stripped, ({ before }) => /CHAL_\d+|CONV_\d+/.test(before))).toBe(521);
    expect(count(stripped, ({ after }) => /CHAL_\d+|CONV_\d+/.test(after))).toBe(9);
    expect(
      count(conversations, (conversation) => conversation.posts.some((post) => /CHAL_\d+/.test(post.content))),
    ).toBe(10);
  });

  it("leaves no empty heading, empty code fence, line equal to the topic or empty description", () => {
    for (const { topic, after } of stripped) {
      const lines = after.split("\n");
      const content = lines.filter((line) => line.trim() !== "");

      expect(after).not.toBe("");
      expect(lines.map((line) => line.trim())).not.toContain(topic);

      let insideFence = false;
      content.forEach((line, index) => {
        const next = content[index + 1];
        if (line.startsWith("```")) {
          // An opening fence directly followed by its closing fence is empty.
          if (!insideFence) expect(next?.startsWith("```")).toBe(false);
          insideFence = !insideFence;
        } else if (!insideFence && /^#{1,6}\s/.test(line)) {
          expect(next).toBeDefined();
          expect(next).not.toMatch(/^#{1,6}\s/);
        }
      });
    }
  });

  it("keeps 105 conversations answered without an accepted answer", () => {
    const answeredWithout = count(
      conversations,
      (conversation) => conversation.status === "answered" && conversation.acceptedPostId === null,
    );

    expect(answeredWithout).toBe(105);
  });

  it("never has the opening post as the accepted answer; 20 are solved by the asker", () => {
    expect(count(conversations, (conversation) => conversation.acceptedPostId !== null)).toBe(357);
    expect(count(conversations, (conversation) => conversation.acceptedPostId === conversation.posts[0]?.postId)).toBe(
      0,
    );
    expect(count(conversations, isSolvedByAsker)).toBe(20);
  });

  it("matches the tab counts: 128 open, 294 resolved, 169 of them with an accepted answer", () => {
    expect(count(conversations, (conversation) => conversation.status === "open")).toBe(128);
    expect(count(conversations, (conversation) => conversation.status === "resolved")).toBe(294);
    expect(
      count(
        conversations,
        (conversation) => conversation.status === "resolved" && conversation.acceptedPostId !== null,
      ),
    ).toBe(169);
  });

  it("has 164 unassigned conversations", () => {
    expect(count(conversations, (conversation) => conversation.assignee === null)).toBe(164);
  });

  it("has no resolution time for 375 conversations, all of them open or answered", () => {
    const without = conversations.filter((conversation) => conversation.resolutionTimeHours === null);

    expect(without).toHaveLength(375);
    expect(without.every((conversation) => ["open", "answered"].includes(conversation.status))).toBe(true);
    expect(
      count(conversations, (conversation) => ["resolved", "closed"].includes(conversation.status)) + without.length,
    ).toBe(800);
  });

  it("shares a title between 723 of the 800 conversations", () => {
    const perTitle = new Map<string, number>();
    for (const { title } of conversations) perTitle.set(title, (perTitle.get(title) ?? 0) + 1);

    expect(count(conversations, (conversation) => (perTitle.get(conversation.title) ?? 0) > 1)).toBe(723);
  });

  it("links every conversation to an existing challenge, in 13 categories", () => {
    const challengeIds = new Set(challenges.map((challenge) => challenge.id));

    expect(conversations.every((conversation) => challengeIds.has(conversation.challengeId))).toBe(true);
    expect(new Set(conversations.map((conversation) => conversation.category)).size).toBe(13);
  });

  it("has 18 draft or archived challenges, each with conversations", () => {
    const hidden = challenges.filter((challenge) => challenge.status !== "published");
    const withConversations = new Set(conversations.map((conversation) => conversation.challengeId));

    expect(hidden).toHaveLength(18);
    expect(hidden.every((challenge) => withConversations.has(challenge.id))).toBe(true);
  });

  it("stores points as a string for CHAL_022 only, and normalizes it to 225", () => {
    expect(rawChallenges.filter((raw) => typeof raw.points !== "number").map((raw) => raw.challenge_id)).toEqual([
      "CHAL_022",
    ]);
    expect(challenges.find((challenge) => challenge.id === "CHAL_022")?.points).toBe(225);
  });

  it("repeats 13 challenge titles, never inside one category", () => {
    const perTitle = new Map<string, Set<string>>();
    for (const { title, category } of challenges) {
      perTitle.set(title, (perTitle.get(title) ?? new Set()).add(category));
    }
    const repeated = challenges.filter(
      (challenge) => count(challenges, (other) => other.title === challenge.title) > 1,
    );

    expect(new Set(repeated.map((challenge) => challenge.title)).size).toBe(13);
    for (const challenge of repeated) {
      const sameTitle = count(challenges, (other) => other.title === challenge.title);
      expect(perTitle.get(challenge.title)?.size).toBe(sameTitle);
    }
  });
});
