import { UNASSIGNED, type ConversationSummary, type ConversationTab, type Paged } from "../../api/contract";
import type { Conversation } from "../../domain/types";
import type { Store } from "../db/store";
import type { ListParams } from "./parseListParams";

const EXCERPT_LENGTH = 200;

const TAB_FILTERS: Record<ConversationTab, (conversation: Conversation) => boolean> = {
  latest: () => true,
  unanswered: (conversation) => conversation.status === "open",
  solved: (conversation) => conversation.status === "resolved",
  attention: (conversation) =>
    conversation.status === "open" &&
    (conversation.assignee === null || conversation.priority === "high" || conversation.priority === "urgent"),
};

/** Search reads the title and the description, which normalization has already cleared of record metadata (D31). */
const matchesSearch = (conversation: Conversation, q: string): boolean => {
  const needle = q.toLowerCase();
  return conversation.title.toLowerCase().includes(needle) || conversation.description.toLowerCase().includes(needle);
};

const matchesAssignee = (conversation: Conversation, assignee: string): boolean => {
  return assignee === UNASSIGNED ? conversation.assignee === null : conversation.assignee === assignee;
};

const matches = (conversation: Conversation, params: ListParams): boolean => {
  return (
    TAB_FILTERS[params.tab](conversation) &&
    (params.category === undefined || conversation.category === params.category) &&
    (params.challengeId === undefined || conversation.challengeId === params.challengeId) &&
    (params.tag === undefined || conversation.tags.includes(params.tag)) &&
    (params.priority === undefined || conversation.priority === params.priority) &&
    (params.assignee === undefined || matchesAssignee(conversation, params.assignee)) &&
    (params.q === undefined || matchesSearch(conversation, params.q))
  );
};

const byLatestActivity = (a: Conversation, b: Conversation): number => {
  return Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt) || a.id.localeCompare(b.id);
};

/** Cuts at the last whole word that fits. Opening posts are plain text, so nothing is stripped (D24). */
const toExcerpt = (content: string): string => {
  if (content.length <= EXCERPT_LENGTH) {
    return content;
  }
  const cut = content.slice(0, EXCERPT_LENGTH + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : EXCERPT_LENGTH).trimEnd()}…`;
};

const toSummary = (conversation: Conversation, store: Store, includeTriage: boolean): ConversationSummary => {
  const opening = conversation.posts[0];
  const challenge = store.challenges.get(conversation.challengeId);
  return {
    id: conversation.id,
    title: conversation.title,
    author: opening?.author ?? "",
    excerpt: toExcerpt(opening?.content ?? ""),
    status: conversation.status,
    hasAcceptedAnswer: conversation.acceptedPostId !== null,
    votes: opening?.upvotes ?? 0,
    replyCount: Math.max(conversation.posts.length - 1, 0),
    challengeTitle: challenge?.title ?? "",
    challengeCategory: challenge?.category ?? "",
    lastActivityAt: conversation.lastActivityAt,
    ...(includeTriage ? { priority: conversation.priority, assignee: conversation.assignee } : {}),
  };
};

/**
 * One page of the Community list, newest activity first. `params` holds only what the viewer may use, and
 * `includeTriage` says whether the rows carry priority and assignee: the handler decides both with `can()`.
 */
export const listConversations = (
  store: Store,
  params: ListParams,
  options: { includeTriage: boolean },
): Paged<ConversationSummary> => {
  const found = store.conversations.filter((conversation) => matches(conversation, params)).sort(byLatestActivity);
  const start = (params.page - 1) * params.pageSize;
  return {
    items: found
      .slice(start, start + params.pageSize)
      .map((conversation) => toSummary(conversation, store, options.includeTriage)),
    page: params.page,
    pageSize: params.pageSize,
    total: found.length,
  };
};
