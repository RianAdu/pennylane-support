import type { RawChallenge, RawConversation } from "../domain/types";
import { createStore } from "../mocks/db/store";
import { createHandlers } from "../mocks/handlers";
import { server } from "../mocks/node";
import { rawChallenge } from "./fixtures";

/** Puts the mock API in front of these records for the current test. */
export const serve = (
  conversations: RawConversation[],
  challenges: RawChallenge[] = [rawChallenge({ challenge_id: "CHAL_001" })],
): void => {
  server.use(...createHandlers(createStore(conversations, challenges)));
};
