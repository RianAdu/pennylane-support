import type { Insights, MonthCount, StrugglingChallenge } from "../../api/contract";
import type { Conversation } from "../../domain/types";
import type { Store } from "../db/store";
import { titleRepeats } from "./titleRepeats";

/** How many challenges "Where learners struggle" ranks. */
const STRUGGLING_LENGTH = 8;

const median = (values: number[]): number | null => {
  const sorted = [...values].sort((a, b) => a - b);
  const upper = sorted.at(Math.floor(sorted.length / 2));
  // With an even count there is no middle value, so the two beside the middle are averaged.
  const lower = sorted.length % 2 === 1 ? upper : sorted.at(sorted.length / 2 - 1);
  return upper === undefined || lower === undefined ? null : (lower + upper) / 2;
};

/** "2024-02". The data's timestamps are UTC, and the month is read in UTC so it is the same for every viewer. */
const monthOf = (iso: string): string => new Date(iso).toISOString().slice(0, 7);

const monthAfter = (month: string): string => {
  const next = new Date(`${month}-01T00:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  return monthOf(next.toISOString());
};

/** Every month from the first conversation to the last, so a month without any shows as 0 rather than as a gap. */
const countPerMonth = (conversations: readonly Conversation[]): MonthCount[] => {
  const counts = new Map<string, number>();
  for (const { createdAt } of conversations) {
    const month = monthOf(createdAt);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  const months = [...counts.keys()].sort();
  const last = months.at(-1);
  const perMonth: MonthCount[] = [];
  for (
    let month = months.at(0);
    month !== undefined && last !== undefined && month <= last;
    month = monthAfter(month)
  ) {
    perMonth.push({ month, count: counts.get(month) ?? 0 });
  }
  return perMonth;
};

/**
 * The challenges with the most open threads. Among equals the one fewer learners complete comes first. A draft or
 * archived challenge is ranked like any other: its threads are visible and still waiting.
 */
const rankStruggling = (store: Store, open: readonly Conversation[]): StrugglingChallenge[] => {
  const openCounts = new Map<string, number>();
  for (const { challengeId } of open) {
    openCounts.set(challengeId, (openCounts.get(challengeId) ?? 0) + 1);
  }

  return [...openCounts]
    .flatMap(([challengeId, openCount]) => {
      const challenge = store.challenges.get(challengeId);
      return challenge ? [{ challenge, openCount }] : [];
    })
    .sort((a, b) => {
      return (
        b.openCount - a.openCount ||
        a.challenge.completionRate - b.challenge.completionRate ||
        a.challenge.id.localeCompare(b.challenge.id)
      );
    })
    .slice(0, STRUGGLING_LENGTH)
    .map(({ challenge, openCount }) => ({
      challengeId: challenge.id,
      title: challenge.title,
      category: challenge.category,
      titleRepeats: titleRepeats(store, challenge),
      status: challenge.status,
      openCount,
      completionRate: challenge.completionRate,
    }));
};

/** Everything the Insights page shows, aggregated here as a backend would, so the browser only formats it. */
export const computeInsights = (store: Store): Insights => {
  const { conversations } = store;
  const open = conversations.filter((conversation) => conversation.status === "open");
  // `resolutionTimeHours` is used as given, and only where the thread is finished: it is null everywhere else.
  const resolutionTimes = conversations.flatMap(({ status, resolutionTimeHours }) => {
    return (status === "resolved" || status === "closed") && resolutionTimeHours !== null ? [resolutionTimeHours] : [];
  });
  const perMonth = countPerMonth(conversations);

  return {
    total: conversations.length,
    open: open.length,
    openUnassigned: open.filter((conversation) => conversation.assignee === null).length,
    medianResolutionHours: median(resolutionTimes),
    withAcceptedAnswer: conversations.filter((conversation) => conversation.acceptedPostId !== null).length,
    perMonth,
    // The first of equals, so the earliest month wins a tie.
    busiestMonth: perMonth.reduce<MonthCount | null>((busiest, month) => {
      return busiest === null || month.count > busiest.count ? month : busiest;
    }, null),
    struggling: rankStruggling(store, open),
  };
};
