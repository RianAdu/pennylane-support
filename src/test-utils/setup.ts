import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "../mocks/node";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// jsdom has no layout, so it cannot scroll and logs an error when asked to. The router asks on every navigation.
window.scrollTo = () => {};

// Vitest globals are off, so Testing Library cannot register its own cleanup.
afterEach(() => {
  cleanup();
  server.resetHandlers();
  window.localStorage.clear();
});

afterAll(() => {
  server.close();
});
