import type { ChallengeGroups } from "../../api/contract";
import type { Store } from "../db/store";
import { titleRepeats } from "./titleRepeats";

/** What opens or closes a code block. */
const FENCE = "```";
/** A line of Markdown that is structure rather than a sentence: a heading, a table row, a quote, a list item, a rule. */
const STRUCTURE = /^(#|\||>|[-*+] |\d+\. |---)/;

/**
 * The first sentence-like line of a description. Some descriptions are one sentence; most are Markdown that opens
 * with a heading and a table, and a card has room for one line.
 */
export const toSummary = (description: string): string => {
  let inCode = false;
  for (const line of description.split("\n")) {
    const text = line.trim();
    if (text.startsWith(FENCE)) {
      inCode = !inCode;
    } else if (!inCode && text !== "" && !STRUCTURE.test(text)) {
      return text;
    }
  }
  return "";
};

/**
 * The challenges for the Challenges page, grouped by category. Categories and challenges keep the order of the
 * data, which is the order they are taught in. Draft and archived challenges are left out unless asked for.
 */
export const listChallenges = (store: Store, options: { includeHidden: boolean }): ChallengeGroups => {
  const openCounts = new Map<string, number>();
  for (const { challengeId, status } of store.conversations) {
    if (status === "open") {
      openCounts.set(challengeId, (openCounts.get(challengeId) ?? 0) + 1);
    }
  }

  const groups = new Map<string, ChallengeGroups["categories"][number]>();
  for (const challenge of store.challenges.values()) {
    if (challenge.status !== "published" && !options.includeHidden) {
      continue;
    }
    const group = groups.get(challenge.category) ?? { name: challenge.category, challenges: [] };
    groups.set(challenge.category, group);
    group.challenges.push({
      id: challenge.id,
      title: challenge.title,
      titleRepeats: titleRepeats(store, challenge),
      difficulty: challenge.difficulty,
      summary: toSummary(challenge.description),
      openQuestionCount: openCounts.get(challenge.id) ?? 0,
    });
  }
  return { categories: [...groups.values()] };
};
