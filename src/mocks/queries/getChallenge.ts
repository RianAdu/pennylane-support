import type { ChallengeDetail } from "../../api/contract";
import type { Store } from "../db/store";

/**
 * One challenge with what the support system knows about it. A draft or archived challenge is returned like any
 * other: its threads stay visible, so the pages that show those threads need its name.
 */
export const getChallenge = (store: Store, id: string): ChallengeDetail | undefined => {
  const challenge = store.challenges.get(id);
  if (!challenge) {
    return undefined;
  }

  const openQuestionCount = store.conversations.filter((conversation) => {
    return conversation.challengeId === id && conversation.status === "open";
  }).length;
  const titleRepeats = [...store.challenges.values()].some((other) => {
    return other.id !== id && other.title === challenge.title;
  });
  return { ...challenge, openQuestionCount, titleRepeats };
};
