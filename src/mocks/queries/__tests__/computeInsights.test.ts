import { describe, expect, it } from "vitest";
import { rawChallenge, rawConversation } from "../../../test-utils/fixtures";
import { createStore } from "../../db/store";
import { computeInsights } from "../computeInsights";

const open = (identifier: string, challengeId: string) => {
  return rawConversation({ identifier, challenge_id: challengeId, status: "open" });
};

describe("insights", () => {
  it("takes the median over resolved and closed threads only, halfway between the two middle ones", () => {
    const store = createStore(
      [
        rawConversation({ identifier: "a", status: "resolved", resolution_time_hours: 10 }),
        rawConversation({ identifier: "b", status: "closed", resolution_time_hours: 20 }),
        rawConversation({ identifier: "c", status: "resolved", resolution_time_hours: 40 }),
        rawConversation({ identifier: "d", status: "closed", resolution_time_hours: 100 }),
        rawConversation({ identifier: "e", status: "answered", resolution_time_hours: 1 }),
      ],
      [],
    );

    expect(computeInsights(store).medianResolutionHours).toBe(30);
  });

  it("counts an open thread as unassigned only when nobody is assigned", () => {
    const store = createStore(
      [
        rawConversation({ identifier: "a", status: "open", assigned_to: null }),
        rawConversation({ identifier: "b", status: "open", assigned_to: "community_mod" }),
        rawConversation({ identifier: "c", status: "answered", assigned_to: null }),
      ],
      [],
    );

    expect(computeInsights(store)).toMatchObject({ open: 2, openUnassigned: 1 });
  });

  it("shows a month without conversations as 0, across a change of year", () => {
    const store = createStore(
      [
        rawConversation({ identifier: "a", created_at: "2024-11-30T23:59:00Z" }),
        rawConversation({ identifier: "b", created_at: "2025-01-01T00:00:00Z" }),
        rawConversation({ identifier: "c", created_at: "2025-01-20T12:00:00Z" }),
      ],
      [],
    );

    const { perMonth, busiestMonth } = computeInsights(store);

    expect(perMonth).toEqual([
      { month: "2024-11", count: 1 },
      { month: "2024-12", count: 0 },
      { month: "2025-01", count: 2 },
    ]);
    expect(busiestMonth).toEqual({ month: "2025-01", count: 2 });
  });

  it("ranks challenges by open threads, and among equals puts the one fewer learners complete first", () => {
    const store = createStore(
      [
        open("a", "CHAL_EASY"),
        open("b", "CHAL_EASY"),
        open("c", "CHAL_HARD"),
        open("d", "CHAL_HARD"),
        open("e", "CHAL_BUSY"),
        open("f", "CHAL_BUSY"),
        open("g", "CHAL_BUSY"),
        rawConversation({ identifier: "h", challenge_id: "CHAL_DONE", status: "resolved" }),
      ],
      [
        rawChallenge({ challenge_id: "CHAL_EASY", completion_rate: 0.9 }),
        rawChallenge({ challenge_id: "CHAL_HARD", completion_rate: 0.2 }),
        rawChallenge({ challenge_id: "CHAL_BUSY", completion_rate: 0.5, status: "archived" }),
        rawChallenge({ challenge_id: "CHAL_DONE" }),
      ],
    );

    const ranked = computeInsights(store).struggling.map(({ challengeId, openCount }) => [challengeId, openCount]);

    expect(ranked).toEqual([
      ["CHAL_BUSY", 3],
      ["CHAL_HARD", 2],
      ["CHAL_EASY", 2],
    ]);
  });

  it("has no median, no busiest month and no ranking when there are no conversations", () => {
    expect(computeInsights(createStore([], []))).toMatchObject({
      medianResolutionHours: null,
      busiestMonth: null,
      perMonth: [],
      struggling: [],
    });
  });
});
