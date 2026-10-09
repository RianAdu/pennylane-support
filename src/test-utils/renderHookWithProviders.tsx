import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import type { ViewerRole } from "../domain/types";
import { createQueryClient } from "../providers/queryClient";
import { ROLE_STORAGE_KEY, RoleProvider } from "../providers/role/RoleProvider";

/** Renders a hook inside the app's providers, with a cache of its own and the viewer starting as `role`. */
export const renderHookWithProviders = <T,>(hook: () => T, { role = "learner" }: { role?: ViewerRole } = {}) => {
  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <RoleProvider>{children}</RoleProvider>
      </QueryClientProvider>
    );
  };
  return renderHook(hook, { wrapper });
};
