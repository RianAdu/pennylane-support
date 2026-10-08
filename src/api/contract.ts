import type { ConversationStatus, Priority } from "../domain/types";

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

export type Meta = {
  categories: { name: string; count: number }[];
  tags: string[];
  /** Admin only: the key is absent from a learner's response. */
  assignees?: string[];
};
