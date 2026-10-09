import { delay, http, type HttpHandler } from "msw";
import type { Store } from "../db/store";
import { challengeHandlers } from "./challenges";
import { conversationHandlers } from "./conversations";
import { metaHandlers } from "./meta";

type HandlerOptions = {
  /** How long each response waits, in milliseconds. Left out, responses are immediate, which is what tests want. */
  delayMs?: () => number;
};

/** The whole mock API over one store. The store and the delay are passed in, so nothing here checks where it runs. */
export const createHandlers = (store: Store, { delayMs }: HandlerOptions = {}): HttpHandler[] => {
  // A handler that returns nothing passes the request on to the next match, so this one only adds the wait.
  const latency = delayMs
    ? [
        http.all("/api/*", async () => {
          await delay(delayMs());
        }),
      ]
    : [];
  return [...latency, ...conversationHandlers(store), ...challengeHandlers(store), ...metaHandlers(store)];
};
