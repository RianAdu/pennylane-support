import { defineConfig, devices } from "@playwright/test";

// A port of its own, so the run never talks to a dev server that happens to be open on Vite's default one.
const PORT = 5174;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    // The app turns its transitions off for this setting, so nothing is checked or captured mid-movement.
    reducedMotion: "reduce",
  },
  projects: [
    { name: "e2e", testMatch: "*.spec.ts", use: { ...devices["Desktop Chrome"] } },
    // Rewrites docs/screenshots. A project of its own, so a test run never touches the images.
    { name: "screenshots", testMatch: "*.capture.ts", use: { ...devices["Desktop Chrome"] } },
  ],
  // The mock server is a service worker inside the app, so the dev server is the whole backend.
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
