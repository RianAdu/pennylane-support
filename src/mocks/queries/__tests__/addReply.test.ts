import { expect, it } from "vitest";
import { rawConversation, rawPost } from "../../../test-utils/fixtures";
import { createStore } from "../../db/store";
import { listConversations } from "../listConversations";
import { parseListParams } from "../parseListParams";
import { addReply } from "../addReply";

const NOW = "2025-01-15T12:00:00Z";

const storeWithThread = () => {
  return createStore(
    [rawConversation({ posts: [rawPost({ post_id: 1 }), rawPost({ post_id: 4, timestamp: "2024-03-02T10:00:00Z" })] })],
    [],
  );
};

it("adds the reply last, with the next post id, and moves the thread's last activity and reply count", () => {
  const store = storeWithThread();
  const [conversation] = store.conversations;

  expect(addReply(conversation!, { content: "  Try more shots.  ", role: "learner", now: NOW })).toBe(true);

  expect(conversation!.posts.at(-1)).toMatchObject({
    postId: 5,
    author: "you",
    roleAtPosting: "learner",
    postedAt: NOW,
    content: "Try more shots.",
  });
  const [row] = listConversations(store, parseListParams(new URLSearchParams()), { includeTriage: false }).items;
  expect(row).toMatchObject({ replyCount: 2, lastActivityAt: NOW });
});

it("posts an admin's reply as staff, since admin is not a role a post can carry", () => {
  const [conversation] = storeWithThread().conversations;

  addReply(conversation!, { content: "Fixed in the next release.", role: "admin", now: NOW });

  expect(conversation!.posts.at(-1)?.roleAtPosting).toBe("staff");
});

it("posts nothing when the reply is only spaces", () => {
  const [conversation] = storeWithThread().conversations;

  expect(addReply(conversation!, { content: "   ", role: "learner", now: NOW })).toBe(false);
  expect(conversation!.posts).toHaveLength(2);
});
