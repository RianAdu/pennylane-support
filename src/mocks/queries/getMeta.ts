import type { Meta } from "../../api/contract";
import type { Store } from "../db/store";

const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort((a, b) => a.localeCompare(b));

/** Menu options. The category counts are totals: they do not follow the search or the filters (FR-3). */
export const getMeta = (store: Store, options: { includeAssignees: boolean }): Meta => {
  const counts = new Map<string, number>();
  for (const { category } of store.conversations) {
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  const assignees = store.conversations.flatMap(({ assignee }) => (assignee === null ? [] : [assignee]));
  return {
    categories: sorted(counts.keys()).map((name) => ({ name, count: counts.get(name) ?? 0 })),
    tags: sorted(store.conversations.flatMap((conversation) => conversation.tags)),
    ...(options.includeAssignees ? { assignees: sorted(assignees) } : {}),
  };
};
