import type { Challenge, ChallengeStatus, ConversationStatus, Post, Priority } from "../domain/types";

// The HTTP contract: the shapes that cross `/api`. The mock server implements it as a real backend would, and the
// app reads it through the hooks in this folder.

export const CONVERSATION_TABS = ["latest", "unanswered", "solved", "attention"] as const;
export type ConversationTab = (typeof CONVERSATION_TABS)[number];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

/** The `assignee` filter value that matches threads nobody is assigned to. */
export const UNASSIGNED = "unassigned";

export type Paged<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

/** One row of the Community list. */
export type ConversationSummary = {
  id: string;
  title: string;
  /** The person who asked. */
  author: string;
  excerpt: string;
  status: ConversationStatus;
  hasAcceptedAnswer: boolean;
  /** The opening post's upvotes: "N people have this question too". */
  votes: number;
  replyCount: number;
  challengeTitle: string;
  challengeCategory: string;
  lastActivityAt: string;
  /** Admin only: the key is absent from a learner's response. */
  priority?: Priority;
  /** Admin only: the key is absent from a learner's response. `null` means unassigned. */
  assignee?: string | null;
};

/** One thread with its posts, as `GET /api/conversations/:id` returns it. */
export type ConversationDetail = {
  id: string;
  title: string;
  category: string;
  status: ConversationStatus;
  tags: string[];
  createdAt: string;
  /** A locked thread takes no replies. */
  locked: boolean;
  challengeId: string;
  /** The opening post first, then the replies in time order. */
  posts: Post[];
  acceptedPostId: number | null;
  /** The accepted answer was written by the person who asked. */
  solvedByAsker: boolean;
  /** Admin only: the key is absent from a learner's response. */
  priority?: Priority;
  /** Admin only: the key is absent from a learner's response. `null` means unassigned. */
  assignee?: string | null;
};

/** The body of `POST /api/conversations/:id/posts`. */
export type ReplyBody = {
  content: string;
};

/** The body of `PATCH /api/conversations/:id`. Status is the one field the server takes. */
export type ConversationPatch = {
  status: ConversationStatus;
};

export type Meta = {
  categories: { name: string; count: number }[];
  tags: string[];
  /** Admin only: the key is absent from a learner's response. */
  assignees?: string[];
};

/** One challenge, as `GET /api/challenges/:id` returns it. Draft and archived challenges are returned too. */
export type ChallengeDetail = Challenge & {
  /** How many threads about this challenge have the status open. */
  openQuestionCount: number;
  /** Another challenge has the same title, so the category is shown beside it. */
  titleRepeats: boolean;
};

/** One month of new conversations. */
export type MonthCount = {
  /** The UTC month a conversation was started in, as "2024-02". */
  month: string;
  count: number;
};

/** One row of "Where learners struggle". */
export type StrugglingChallenge = {
  challengeId: string;
  title: string;
  category: string;
  /** Another challenge has the same title, so the category is shown beside it. */
  titleRepeats: boolean;
  /** A draft or archived challenge is ranked too: its threads are still waiting. */
  status: ChallengeStatus;
  /** How many threads about this challenge have the status open. */
  openCount: number;
  /** The share of attempts that complete the challenge, from 0 to 1. */
  completionRate: number;
};

/** What `GET /api/insights` returns, to an admin only. Aggregated by the server; the page only formats it. */
export type Insights = {
  /** All conversations: what the counts below are a share of. */
  total: number;
  open: number;
  openUnassigned: number;
  /** Over resolved and closed conversations. `null` when there are none. */
  medianResolutionHours: number | null;
  withAcceptedAnswer: number;
  /** Every month from the first conversation to the last, in order, with 0 for a month without any. */
  perMonth: MonthCount[];
  /** `null` when there are no conversations. */
  busiestMonth: MonthCount | null;
  /** The challenges with the most open threads, most first. */
  struggling: StrugglingChallenge[];
};

/** The request header that carries the viewer's role. A real backend would read the session instead. */
export const ROLE_HEADER = "X-Mock-Role";

/** The body of every non-2xx response. */
export type ApiErrorBody = {
  message: string;
};

/** What the app may send to `GET /api/conversations`. Anything left out takes the server's default. */
export type ConversationListQuery = {
  q?: string;
  category?: string;
  tab?: ConversationTab;
  challengeId?: string;
  tag?: string;
  priority?: Priority;
  assignee?: string;
  page?: number;
  pageSize?: number;
};
