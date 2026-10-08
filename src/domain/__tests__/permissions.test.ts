import { describe, expect, it } from "vitest";
import { can, type Action } from "../permissions";

const ADMIN_ONLY: { name: string; action: Action }[] = [
  { name: "see priority, assignee and the Needs attention view", action: "viewTriage" },
  { name: "change the status", action: "setStatus" },
  { name: "assign a thread", action: "assign" },
  { name: "set the priority", action: "setPriority" },
  { name: "pin a thread", action: "pin" },
  { name: "lock a thread", action: "lock" },
  { name: "see Insights", action: "viewInsights" },
  { name: "see draft and archived challenges", action: "viewHiddenChallenges" },
];

describe("can()", () => {
  it("lets a learner browse, search, read and ask", () => {
    expect(can("learner", "read")).toBe(true);
    expect(can("learner", "ask")).toBe(true);
  });

  it("lets an admin browse, search, read and ask", () => {
    expect(can("admin", "read")).toBe(true);
    expect(can("admin", "ask")).toBe(true);
  });

  it("lets a learner reply, but not on a locked thread", () => {
    expect(can("learner", "reply")).toBe(true);
    expect(can("learner", "reply", { isLocked: false })).toBe(true);
    expect(can("learner", "reply", { isLocked: true })).toBe(false);
  });

  it("lets an admin reply, but not on a locked thread", () => {
    expect(can("admin", "reply")).toBe(true);
    expect(can("admin", "reply", { isLocked: false })).toBe(true);
    expect(can("admin", "reply", { isLocked: true })).toBe(false);
  });

  it("lets a learner mark an accepted answer on their own thread only", () => {
    expect(can("learner", "acceptAnswer", { isOwnThread: true })).toBe(true);
    expect(can("learner", "acceptAnswer", { isOwnThread: false })).toBe(false);
  });

  it("lets a learner mark a thread solved on their own thread only", () => {
    expect(can("learner", "markSolved", { isOwnThread: true })).toBe(true);
    expect(can("learner", "markSolved", { isOwnThread: false })).toBe(false);
  });

  it("lets an admin mark an accepted answer on any thread", () => {
    expect(can("admin", "acceptAnswer", { isOwnThread: true })).toBe(true);
    expect(can("admin", "acceptAnswer", { isOwnThread: false })).toBe(true);
    expect(can("admin", "acceptAnswer")).toBe(true);
  });

  it("lets an admin mark any thread solved", () => {
    expect(can("admin", "markSolved", { isOwnThread: true })).toBe(true);
    expect(can("admin", "markSolved", { isOwnThread: false })).toBe(true);
    expect(can("admin", "markSolved")).toBe(true);
  });

  it("treats a thread of unknown ownership as not the learner's own", () => {
    expect(can("learner", "acceptAnswer")).toBe(false);
    expect(can("learner", "markSolved", {})).toBe(false);
  });

  it.each(ADMIN_ONLY)("lets only the admin $name, even on the learner's own thread", ({ action }) => {
    expect(can("admin", action)).toBe(true);
    expect(can("learner", action)).toBe(false);
    expect(can("learner", action, { isOwnThread: true })).toBe(false);
  });
});
