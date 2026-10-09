import type { ViewerRole } from "../domain/types";
import type { ConversationListQuery } from "./contract";

// The role is part of every key: the server answers each role differently, so one role's cached answer must never
// be shown to the other.

export const conversationsKey = (role: ViewerRole, query: ConversationListQuery) => {
  return ["conversations", role, query] as const;
};

export const conversationKey = (role: ViewerRole, id: string | undefined) => {
  return ["conversation", role, id] as const;
};

export const challengeKey = (role: ViewerRole, id: string | undefined) => {
  return ["challenge", role, id] as const;
};

export const challengesKey = (role: ViewerRole) => {
  return ["challenges", role] as const;
};

export const metaKey = (role: ViewerRole) => {
  return ["meta", role] as const;
};

export const insightsKey = (role: ViewerRole) => {
  return ["insights", role] as const;
};

/**
 * What a reply or a status change can make stale: the thread, every list that may hold it, the counts of open
 * questions on a challenge and on the challenge cards, and the insights counted from the statuses. Each is the start
 * of a key, so the cached answers of both roles are refreshed, not only the current viewer's.
 */
export const STALE_AFTER_THREAD_CHANGE = [
  ["conversations"],
  ["conversation"],
  ["challenge"],
  ["challenges"],
  ["insights"],
] as const;
