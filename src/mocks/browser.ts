import { setupWorker } from "msw/browser";
import { loadStore } from "./db/store";
import { createHandlers } from "./handlers";

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 500;

// A realistic wait, so loading states show up in the browser as they would against a real server.
const delayMs = (): number => MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

export const worker = setupWorker(...createHandlers(loadStore(), { delayMs }));
