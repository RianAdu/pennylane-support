import type { ViewerRole } from "./types";

export const ACTIONS = [
  "read",
  "ask",
  "reply",
  "acceptAnswer",
  "markSolved",
  "viewTriage",
  "setStatus",
  "assign",
  "setPriority",
  "pin",
  "lock",
  "viewInsights",
  "viewHiddenChallenges",
] as const;
export type Action = (typeof ACTIONS)[number];

export interface PermissionContext {
  /** The viewer started the thread. Unknown counts as not their own. */
  isOwnThread?: boolean;
  isLocked?: boolean;
}

type Rule = "always" | "never" | "ownThread" | "unlessLocked";

// The Roles and permissions table from docs/requirements.md, one row per viewer role. `viewTriage` covers seeing
// priority and assignee and the Needs attention view. A new role is a new row.
const RULES: Record<ViewerRole, Record<Action, Rule>> = {
  learner: {
    read: "always",
    ask: "always",
    reply: "unlessLocked",
    acceptAnswer: "ownThread",
    markSolved: "ownThread",
    viewTriage: "never",
    setStatus: "never",
    assign: "never",
    setPriority: "never",
    pin: "never",
    lock: "never",
    viewInsights: "never",
    viewHiddenChallenges: "never",
  },
  admin: {
    read: "always",
    ask: "always",
    reply: "unlessLocked",
    acceptAnswer: "always",
    markSolved: "always",
    viewTriage: "always",
    setStatus: "always",
    assign: "always",
    setPriority: "always",
    pin: "always",
    lock: "always",
    viewInsights: "always",
    viewHiddenChallenges: "always",
  },
};

/** The only place permissions are decided: the UI calls it to hide controls, the mock server to refuse requests. */
export function can(role: ViewerRole, action: Action, context: PermissionContext = {}): boolean {
  switch (RULES[role][action]) {
    case "always":
      return true;
    case "never":
      return false;
    case "ownThread":
      return context.isOwnThread === true;
    case "unlessLocked":
      return context.isLocked !== true;
  }
}
