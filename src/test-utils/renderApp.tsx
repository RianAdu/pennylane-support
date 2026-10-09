import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { App } from "../app/App";
import { routes } from "../router/routes";
import type { ViewerRole } from "../domain/types";
import { createQueryClient } from "../providers/queryClient";
import { ROLE_STORAGE_KEY, RoleProvider } from "../providers/role/RoleProvider";

/** Renders the whole app at `path`, with a cache of its own and the viewer starting as `role`. */
export const renderApp = (path: string, { role = "learner" }: { role?: ViewerRole } = {}) => {
  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <RoleProvider>
        <App router={router} />
      </RoleProvider>
    </QueryClientProvider>,
  );
};
