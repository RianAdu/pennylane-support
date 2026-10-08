import challengesFile from "../../../data/pennylane_coding_challenges.json";
import conversationsFile from "../../../data/pennylane_support_conversations.json";
import { normalizeChallenge, normalizeConversation } from "../../domain/normalize";
import type { Challenge, Conversation, RawChallenge, RawConversation } from "../../domain/types";

export type Store = {
  conversations: Conversation[];
  challenges: Map<string, Challenge>;
};

/** Normalizes the raw records once. Everything the mock server answers is read from the result. */
export const createStore = (
  rawConversations: readonly RawConversation[],
  rawChallenges: readonly RawChallenge[],
): Store => {
  const challenges = rawChallenges.map(normalizeChallenge);
  return {
    conversations: rawConversations.map(normalizeConversation),
    challenges: new Map(challenges.map((challenge) => [challenge.id, challenge])),
  };
};

export const loadStore = (): Store => {
  return createStore(conversationsFile.support_conversations, challengesFile.coding_challenges);
};
