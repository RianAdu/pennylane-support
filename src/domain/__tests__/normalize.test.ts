import { describe, expect, it } from "vitest";
import conversationsFile from "../../../data/pennylane_support_conversations.json";
import {
  isSolvedByAsker,
  normalizeChallenge,
  normalizeConversation,
  orderPosts,
  stripDescriptionMetadata,
} from "../normalize";
import { rawChallenge, rawConversation, rawPost } from "../../test-utils/fixtures";
import type { RawConversation } from "../types";

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

  it("recomputes the last activity from the latest post, not the last one in the file", () => {
    expect(normalizeConversation(outOfOrder).lastActivityAt).toBe("2024-03-02T08:00:00Z");
  });

  it("falls back to the opening post when the description is missing", () => {
    const raw = rawConversation({ posts: [rawPost({ content: "Opening words." })] });
    delete raw.description;

    expect(normalizeConversation(raw).description).toBe("Opening words.");
  });

  it("records the accepted answer by post id, and null when there is none", () => {
    const conversation = normalizeConversation(
      rawConversation({
        posts: [rawPost({ post_id: 1 }), rawPost({ post_id: 2, user: "helper", is_accepted_answer: true })],
      }),
    );

    expect(conversation.acceptedPostId).toBe(2);
    expect(normalizeConversation(rawConversation({ status: "answered" })).acceptedPostId).toBeNull();
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
});

// Invariants over every conversation in the brief's files, after our functions have run.
describe("the brief's data, normalized", () => {
  const rawConversations: RawConversation[] = conversationsFile.support_conversations;
  const conversations = rawConversations.map(normalizeConversation);
  const time = (iso: string) => Date.parse(iso);

  it("opens every conversation with post_id 1 and orders the replies by time, then post id", () => {
    for (const conversation of conversations) {
      const [opening, ...replies] = conversation.posts;

      expect(opening?.postId).toBe(1);
      replies.forEach((reply, index) => {
        const previous = replies[index - 1];
        if (previous === undefined) return;
        const gap = time(reply.postedAt) - time(previous.postedAt);
        expect(gap > 0 || (gap === 0 && reply.postId > previous.postId)).toBe(true);
      });
    }
  });

  it("leaves no status, priority or urgent in any description", () => {
    for (const { description } of conversations) {
      expect(description).not.toMatch(/\b(status|priority|urgent)\b/i);
    }
  });

  // 9 descriptions quote the opening post; a tenth has no description and falls back to it.
  it("leaves an internal ID only in the 10 descriptions that repeat what the asker typed", () => {
    const withId = conversations.filter(({ description }) => /CHAL_\d+|CONV_\d+/.test(description));

    expect(withId).toHaveLength(10);
    for (const { description, posts } of withId) {
      const id = description.match(/CHAL_\d+|CONV_\d+/)?.[0] ?? "";
      expect(posts[0]?.content).toContain(id);
    }
  });

  it("leaves no empty heading, empty code fence, line equal to the title or empty description", () => {
    for (const { title, description } of conversations) {
      const lines = description.split("\n");
      const content = lines.filter((line) => line.trim() !== "");

      expect(description).not.toBe("");
      expect(lines.map((line) => line.trim())).not.toContain(title);

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

  it("never moves the last activity earlier than the raw value", () => {
    for (const [index, raw] of rawConversations.entries()) {
      expect(time(conversations[index]?.lastActivityAt ?? "")).toBeGreaterThanOrEqual(time(raw.last_activity_at));
    }
  });
});
