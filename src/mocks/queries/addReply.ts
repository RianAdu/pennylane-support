import type { Conversation, PostRole, ViewerRole } from "../../domain/types";

/** There is no sign-in, so every reply written in the app is by this one person. */
export const REPLY_AUTHOR = "you";

// Admin is a viewer role, not a label on a post: an admin's reply is posted as staff.
const POST_ROLE_OF: Record<ViewerRole, PostRole> = {
  learner: "learner",
  admin: "staff",
};

type NewReply = {
  content: string;
  role: ViewerRole;
  /** When the reply is posted, as an ISO timestamp. */
  now: string;
};

/**
 * Adds a reply at the end of a thread and moves the thread's last activity to it. The reply count is the number of
 * posts after the first, so it follows. Returns false, and changes nothing, when there is nothing to post.
 */
export const addReply = (conversation: Conversation, { content, role, now }: NewReply): boolean => {
  const text = content.trim();
  if (text === "") {
    return false;
  }
  const lastId = Math.max(...conversation.posts.map((post) => post.postId));
  conversation.posts.push({
    postId: lastId + 1,
    author: REPLY_AUTHOR,
    roleAtPosting: POST_ROLE_OF[role],
    postedAt: now,
    content: text,
    upvotes: 0,
    helpful: 0,
  });
  conversation.lastActivityAt = now;
  return true;
};
