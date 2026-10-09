import { describe, expect, it } from "vitest";
import { rawChallenge, rawConversation } from "../../../test-utils/fixtures";
import { createStore } from "../../db/store";
import { getChallenge } from "../getChallenge";

const store = createStore(
  [
    rawConversation({ identifier: "open-1", challenge_id: "CHAL_A", status: "open" }),
    rawConversation({ identifier: "open-2", challenge_id: "CHAL_A", status: "open" }),
    rawConversation({ identifier: "resolved", challenge_id: "CHAL_A", status: "resolved" }),
    rawConversation({ identifier: "other", challenge_id: "CHAL_B", status: "open" }),
  ],
  [
    rawChallenge({ challenge_id: "CHAL_A", title: "Begin Here", category: "Getting Started" }),
    rawChallenge({ challenge_id: "CHAL_B", title: "Begin Here", category: "Circuits" }),
    rawChallenge({ challenge_id: "CHAL_C", title: "Bell States" }),
  ],
);

describe("one challenge", () => {
  it("counts only the open threads about that challenge", () => {
    expect(getChallenge(store, "CHAL_A")?.openQuestionCount).toBe(2);
  });

  it("says when another challenge has the same title", () => {
    expect(getChallenge(store, "CHAL_A")?.titleRepeats).toBe(true);
    expect(getChallenge(store, "CHAL_C")?.titleRepeats).toBe(false);
  });

  it("finds nothing for an unknown id", () => {
    expect(getChallenge(store, "CHAL_MISSING")).toBeUndefined();
  });
});
