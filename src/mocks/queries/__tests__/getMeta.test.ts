import { describe, expect, it } from "vitest";
import { rawConversation } from "../../../test-utils/fixtures";
import { createStore } from "../../db/store";
import { getMeta } from "../getMeta";

const store = createStore(
  [
    rawConversation({ category: "Demos", tags: ["qnode", "gpu"], assigned_to: "lightning_dev" }),
    rawConversation({ category: "Demos", tags: ["gpu"], assigned_to: null }),
    rawConversation({ category: "Catalyst", tags: [], assigned_to: "community_mod" }),
  ],
  [],
);

describe("meta", () => {
  it("counts the threads in each category and lists each tag once", () => {
    expect(getMeta(store, { includeAssignees: false })).toEqual({
      categories: [
        { name: "Catalyst", count: 1 },
        { name: "Demos", count: 2 },
      ],
      tags: ["gpu", "qnode"],
    });
  });

  it("lists the assignees for an admin, without an entry for unassigned", () => {
    expect(getMeta(store, { includeAssignees: true }).assignees).toEqual(["community_mod", "lightning_dev"]);
  });
});
