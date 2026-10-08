import { describe, expect, it } from "vitest";
import { ACTIONS, can, type Action } from "./permissions";

const ADMIN_ONLY: Action[] = [
  "viewTriage",
  "setStatus",
  "assign",
  "setPriority",
  "pin",
  "lock",
  "viewInsights",
  "viewHiddenChallenges",
];

describe("can()", () => {
  it.each(["learner", "admin"] as const)("lets a %s browse, search, read and ask (FR-1, FR-14)", (role) => {
    expect(can(role, "read")).toBe(true);
    expect(can(role, "ask")).toBe(true);
  });

  it.each(["learner", "admin"] as const)("lets a %s reply, but not on a locked thread (FR-11)", (role) => {
    expect(can(role, "reply")).toBe(true);
    expect(can(role, "reply", { isLocked: false })).toBe(true);
    expect(can(role, "reply", { isLocked: true })).toBe(false);
  });

  it.each(["acceptAnswer", "markSolved"] as const)("lets a learner %s on their own thread only (FR-12)", (action) => {
    expect(can("learner", action, { isOwnThread: true })).toBe(true);
    expect(can("learner", action, { isOwnThread: false })).toBe(false);
  });

  it.each(["acceptAnswer", "markSolved"] as const)("lets an admin %s on any thread (FR-13)", (action) => {
    expect(can("admin", action, { isOwnThread: true })).toBe(true);
    expect(can("admin", action, { isOwnThread: false })).toBe(true);
    expect(can("admin", action)).toBe(true);
  });

  it("treats a thread of unknown ownership as not the learner's own (FR-12)", () => {
    expect(can("learner", "acceptAnswer")).toBe(false);
    expect(can("learner", "markSolved", {})).toBe(false);
  });

  it.each(ADMIN_ONLY)(
    "keeps %s for the admin, even on the learner's own thread (FR-4, FR-7, FR-13, FR-18)",
    (action) => {
      expect(can("admin", action)).toBe(true);
      expect(can("learner", action)).toBe(false);
      expect(can("learner", action, { isOwnThread: true })).toBe(false);
    },
  );

  it("gives the admin everything a learner has", () => {
    for (const action of ACTIONS) {
      for (const context of [{}, { isOwnThread: true }, { isLocked: true }]) {
        if (can("learner", action, context)) {
          expect(can("admin", action, context)).toBe(true);
        }
      }
    }
  });
});
