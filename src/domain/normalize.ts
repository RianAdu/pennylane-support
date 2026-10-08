import {
  CHALLENGE_STATUSES,
  CONVERSATION_STATUSES,
  DIFFICULTIES,
  POST_ROLES,
  PRIORITIES,
  type Challenge,
  type Conversation,
  type Post,
  type RawChallenge,
  type RawConversation,
  type RawPost,
} from "./types";

const oneOf = <T extends string>(allowed: readonly T[], value: string, field: string): T => {
  const match = allowed.find((candidate) => candidate === value);
  if (match === undefined) {
    throw new Error(`Unexpected ${field}: "${value}"`);
  }
  return match;
};

/**
 * The opening post is the one with the lowest `post_id` (always 1 in the data); the replies follow by timestamp,
 * ties broken by `post_id`. Timestamps alone cannot pick the opening post: in 220 conversations a reply is dated
 * before the question (D35).
 */
export const orderPosts = (posts: readonly RawPost[]): RawPost[] => {
  const byPostId = [...posts].sort((a, b) => a.post_id - b.post_id);
  const [opening, ...replies] = byPostId;
  if (opening === undefined) {
    return [];
  }
  replies.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp) || a.post_id - b.post_id);
  return [opening, ...replies];
};

// Lines that restate a field of the record: status, priority, category, topic, tags or an internal ID (D31).
const METADATA_LINES: readonly RegExp[] = [
  /^\*\*Status:\*\*/i,
  /^\*\*Topic:\*\*/i,
  /^>\s*Original topic:/i,
  /^Thread category:/i,
  /^Tags:/i,
  /^Related challenge:/i,
  /^- \[[ x]\] Confirm challenge context/i,
  // The triage table, every row, and the heading that labels it.
  /^\|\s*(Field|-{3,}|Category|Status|Priority|Topic|Tags)\s*\|/i,
  /^#{1,6}\s+Triage notes\s*$/i,
];

const isBlank = (line: string) => line.trim() === "";
const isFence = (line: string) => /^\s*(```|~~~)/.test(line);
const isHeading = (line: string) => /^#{1,6}\s/.test(line);

const isMetadataLine = (line: string, topic: string): boolean => {
  const trimmed = line.trim();
  return trimmed === topic || METADATA_LINES.some((pattern) => pattern.test(trimmed));
};

const dropEmptyFences = (lines: readonly string[]): string[] => {
  const kept: string[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    const close = isFence(line) ? lines.findIndex((candidate, at) => at > index && isFence(candidate)) : -1;
    if (close === -1) {
      kept.push(line);
      index += 1;
      continue;
    }
    const block = lines.slice(index, close + 1);
    if (!block.slice(1, -1).every(isBlank)) {
      kept.push(...block);
    }
    index = close + 1;
  }
  return kept;
};

/** Drops a heading with nothing under it before the next heading or the end. `#` inside a code fence is code. */
const dropEmptyHeadings = (lines: readonly string[]): string[] => {
  let insideFence = false;
  const isCode = lines.map((line) => {
    if (isFence(line)) {
      insideFence = !insideFence;
      return true;
    }
    return insideFence;
  });

  const kept: string[] = [];
  let hasContentBelow = false;
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index] ?? "";
    if (!isCode[index] && isHeading(line)) {
      if (hasContentBelow) {
        kept.push(line);
      }
      hasContentBelow = false;
      continue;
    }
    if (!isBlank(line)) {
      hasContentBelow = true;
    }
    kept.push(line);
  }
  return kept.reverse();
};

/**
 * Removes the lines of a description that restate record fields, then the empty heading or code fence they leave
 * behind. Priority is admin only and search reads the description, so none of it may survive (D31).
 */
export const stripDescriptionMetadata = (description: string, topic: string): string => {
  const withoutMetadata = description.split("\n").filter((line) => !isMetadataLine(line, topic));
  return dropEmptyHeadings(dropEmptyFences(withoutMetadata))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const normalizePost = (raw: RawPost): Post => {
  return {
    postId: raw.post_id,
    author: raw.user,
    roleAtPosting: oneOf(POST_ROLES, raw.user_role, "user_role"),
    postedAt: raw.timestamp,
    content: raw.content,
    upvotes: raw.reactions.upvotes,
    helpful: raw.reactions.helpful,
  };
};

export const normalizeConversation = (raw: RawConversation): Conversation => {
  const ordered = orderPosts(raw.posts);
  const opening = ordered[0];
  if (opening === undefined) {
    throw new Error(`Conversation ${raw.identifier} has no posts`);
  }

  const latest = ordered.reduce((a, b) => (Date.parse(b.timestamp) > Date.parse(a.timestamp) ? b : a));
  const accepted = ordered.find((post) => post.is_accepted_answer);
  const description = raw.description === undefined ? "" : stripDescriptionMetadata(raw.description, raw.topic);

  return {
    id: raw.identifier,
    title: raw.topic,
    category: raw.category,
    challengeId: raw.challenge_id,
    status: oneOf(CONVERSATION_STATUSES, raw.status, "status"),
    priority: oneOf(PRIORITIES, raw.priority, "priority"),
    tags: [...raw.tags],
    createdAt: raw.created_at,
    // The source takes this from the last post in file order, which is wrong for 267 conversations.
    lastActivityAt: latest.timestamp,
    assignee: raw.assigned_to,
    pinned: raw.is_pinned,
    locked: raw.is_locked,
    viewCount: raw.view_count,
    resolutionTimeHours: raw.resolution_time_hours,
    description: description === "" ? opening.content : description,
    posts: ordered.map(normalizePost),
    acceptedPostId: accepted?.post_id ?? null,
  };
};

/** True when the accepted answer was written by the person who asked. The opening post is never the answer. */
export const isSolvedByAsker = (conversation: Pick<Conversation, "posts" | "acceptedPostId">): boolean => {
  const asker = conversation.posts[0]?.author;
  const accepted = conversation.posts.find((post) => post.postId === conversation.acceptedPostId);
  return accepted !== undefined && accepted.author === asker;
};

export const normalizeChallenge = (raw: RawChallenge): Challenge => {
  const points = Number(raw.points);
  if (!Number.isFinite(points)) {
    throw new Error(`Challenge ${raw.challenge_id} has unreadable points: "${raw.points}"`);
  }

  return {
    id: raw.challenge_id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    difficulty: oneOf(DIFFICULTIES, raw.difficulty, "difficulty"),
    points,
    tags: [...raw.tags],
    learningObjectives: [...raw.learning_objectives],
    hints: [...raw.hints],
    status: oneOf(CHALLENGE_STATUSES, raw.status, "challenge status"),
    estimatedMinutes: raw.estimated_minutes,
    completionRate: raw.completion_rate,
    attemptCount: raw.attempt_count,
    averageAttemptsToPass: raw.average_attempts_to_pass,
  };
};
