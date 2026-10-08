import { setupServer } from "msw/node";

// No handlers by default: each test serves the records it is about (src/test/serve.ts), and a request nothing
// handles is an error.
export const server = setupServer();
