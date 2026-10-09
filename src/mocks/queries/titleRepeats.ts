import type { Challenge } from "../../domain/types";
import type { Store } from "../db/store";

/** Another challenge has the same title, so the two are told apart by their category. */
export const titleRepeats = (store: Store, challenge: Challenge): boolean => {
  return [...store.challenges.values()].some((other) => {
    return other.id !== challenge.id && other.title === challenge.title;
  });
};
