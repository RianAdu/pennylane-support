import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/jetbrains-mono/400.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { App } from "./App";
import { routes } from "../router/routes";
import { createQueryClient } from "../providers/queryClient";
import { RoleProvider } from "../providers/role/RoleProvider";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root element in index.html");
}

const queryClient = createQueryClient();
const router = createBrowserRouter(routes);

// The mock server is the app's only backend, so it runs in every build. This is the one place that names `mocks/`:
// with a real backend, this function goes and nothing else changes.
const startMockServer = async (): Promise<void> => {
  const { worker } = await import("../mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
};

// The worker must be ready before the first render, or the first requests would miss it.
const start = async (): Promise<void> => {
  await startMockServer();
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <App router={router} />
        </RoleProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
};

void start();
