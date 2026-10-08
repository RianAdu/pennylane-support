import { CONVERSATION_TABS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, type ConversationTab } from "../../api/contract";
import { PRIORITIES, type Priority } from "../../domain/types";

export type ListParams = {
  q?: string;
  category?: string;
  tab: ConversationTab;
  challengeId?: string;
  tag?: string;
  priority?: Priority;
  assignee?: string;
  page: number;
  pageSize: number;
};

const text = (value: string | null): string | undefined => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? undefined : trimmed;
};

const oneOf = <T extends string>(allowed: readonly T[], value: string | null): T | undefined => {
  return allowed.find((candidate) => candidate === value);
};

const positiveInteger = (value: string | null, fallback: number): number => {
  return value !== null && /^[1-9]\d*$/.test(value) ? Number(value) : fallback;
};

/**
 * Reads the list parameters from a query string. An enumerated or numeric value that is not valid falls back to its
 * default. Roles are not decided here: the handler drops what the viewer may not use before it queries.
 */
export const parseListParams = (search: URLSearchParams): ListParams => {
  return {
    q: text(search.get("q")),
    category: text(search.get("category")),
    tab: oneOf(CONVERSATION_TABS, search.get("tab")) ?? "latest",
    challengeId: text(search.get("challengeId")),
    tag: text(search.get("tag")),
    priority: oneOf(PRIORITIES, search.get("priority")),
    assignee: text(search.get("assignee")),
    page: positiveInteger(search.get("page"), 1),
    pageSize: Math.min(positiveInteger(search.get("pageSize"), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE),
  };
};
