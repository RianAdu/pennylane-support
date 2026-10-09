import type { ViewerRole } from "../domain/types";
import type { ConversationListQuery } from "./contract";

// The role is part of every key: the server answers each role differently, so one role's cached answer must never
// be shown to the other.

export const conversationsKey = (role: ViewerRole, query: ConversationListQuery) => {
  return ["conversations", role, query] as const;
};

export const challengeKey = (role: ViewerRole, id: string | undefined) => {
  return ["challenge", role, id] as const;
};

export const metaKey = (role: ViewerRole) => {
  return ["meta", role] as const;
};
