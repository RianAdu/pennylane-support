import { useCallback, useMemo, useState, type ReactNode } from "react";
import { VIEWER_ROLES, type ViewerRole } from "../../domain/types";
import { RoleContext } from "./RoleContext";

export const ROLE_STORAGE_KEY = "pennylane-support:role";

const DEFAULT_ROLE: ViewerRole = "learner";

/** A missing or unknown stored value, or storage that cannot be read, gives the default role. */
const readStoredRole = (): ViewerRole => {
  try {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return VIEWER_ROLES.find((role) => role === stored) ?? DEFAULT_ROLE;
  } catch {
    return DEFAULT_ROLE;
  }
};

const storeRole = (role: ViewerRole): void => {
  try {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {
    // Storage is blocked or full: the role still holds for this visit.
  }
};

/** The app's only global client state: who is looking. */
export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setCurrentRole] = useState<ViewerRole>(readStoredRole);

  const setRole = useCallback((next: ViewerRole) => {
    storeRole(next);
    setCurrentRole(next);
  }, []);

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
