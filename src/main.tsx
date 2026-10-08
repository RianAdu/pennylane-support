import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { createQueryClient } from "./providers/queryClient";
import { RoleProvider } from "./providers/role/RoleProvider";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root element in index.html");
}

const queryClient = createQueryClient();

// The mock server is the app's only backend, so it runs in every build. This is the one place that names `mocks/`:
// with a real backend, this function goes and nothing else changes.
const startMockServer = async (): Promise<void> => {
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
};

// The worker must be ready before the first render, or the first requests would miss it.
const start = async (): Promise<void> => {
  await startMockServer();
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <App />
        </RoleProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
};

void start();
