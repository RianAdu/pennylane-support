import { describe, expect, it } from "vitest";
import { rawChallenge, rawConversation } from "../../../test-utils/fixtures";
import { createStore } from "../../db/store";
import { listChallenges, toSummary } from "../listChallenges";

const store = createStore(
  [
    rawConversation({ identifier: "open-1", challenge_id: "CHAL_A", status: "open" }),
    rawConversation({ identifier: "open-2", challenge_id: "CHAL_A", status: "open" }),
    rawConversation({ identifier: "resolved", challenge_id: "CHAL_A", status: "resolved" }),
  ],
  [
    rawChallenge({ challenge_id: "CHAL_A", title: "Begin Here", category: "Getting Started" }),
    rawChallenge({ challenge_id: "CHAL_B", title: "Gradients", category: "Optimization" }),
    rawChallenge({ challenge_id: "CHAL_C", title: "Bell States", category: "Getting Started" }),
    rawChallenge({ challenge_id: "CHAL_D", title: "Unreleased", category: "Optimization", status: "draft" }),
    rawChallenge({ challenge_id: "CHAL_E", title: "Retired", category: "Hardware", status: "archived" }),
  ],
);

const titlesByCategory = (includeHidden: boolean) => {
  return listChallenges(store, { includeHidden }).categories.map(({ name, challenges }) => {
    return [name, challenges.map((challenge) => challenge.title)];
  });
};

describe("the challenge cards", () => {
  it("groups published challenges by category, in the order of the data", () => {
    expect(titlesByCategory(false)).toEqual([
      ["Getting Started", ["Begin Here", "Bell States"]],
      ["Optimization", ["Gradients"]],
    ]);
  });

  it("adds draft and archived challenges only when asked", () => {
    expect(titlesByCategory(true)).toEqual([
      ["Getting Started", ["Begin Here", "Bell States"]],
      ["Optimization", ["Gradients", "Unreleased"]],
      ["Hardware", ["Retired"]],
    ]);
  });

  it("counts only the open threads about each challenge", () => {
    const counts = listChallenges(store, { includeHidden: false }).categories.flatMap(({ challenges }) => {
      return challenges.map((challenge) => challenge.openQuestionCount);
    });

    expect(counts).toEqual([2, 0, 0]);
  });

  it("takes the first sentence of a Markdown description, past its heading, table and code", () => {
    const description = [
      "## Overview",
      "",
      "| Item | Value |",
      "| --- | --- |",
      "```python",
      "dev = qml.device('default.qubit')",
      "```",
      "Return the expectation value of a 2-qubit observable.",
      "",
      "If you get stuck, revisit the learning objectives.",
    ].join("\n");

    expect(toSummary(description)).toBe("Return the expectation value of a 2-qubit observable.");
  });
});
