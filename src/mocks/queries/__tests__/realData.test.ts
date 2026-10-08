import { describe, expect, it } from "vitest";
import type { ConversationTab } from "../../../api/contract";
import { loadStore } from "../../db/store";
import { getMeta } from "../getMeta";
import { listConversations } from "../listConversations";
import { parseListParams } from "../parseListParams";

const store = loadStore();

const totalFor = (tab: ConversationTab) => {
  const params = { ...parseListParams(new URLSearchParams()), tab };
  return listConversations(store, params, { includeTriage: true }).total;
};

describe("the brief's data", () => {
  it("has 128 unanswered threads", () => {
    expect(totalFor("unanswered")).toBe(128);
  });

  it("has 294 solved threads", () => {
    expect(totalFor("solved")).toBe(294);
  });

  // Counted by hand in the raw file: 30 open and unassigned, 26 open and high or urgent, 9 of them both.
  it("has 47 threads that need attention", () => {
    expect(totalFor("attention")).toBe(30 + 26 - 9);
  });

  it("spreads all 800 threads over 13 categories", () => {
    const { categories } = getMeta(store, { includeAssignees: false });

    expect(categories).toHaveLength(13);
    expect(categories.reduce((sum, category) => sum + category.count, 0)).toBe(800);
  });
});
