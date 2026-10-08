import { createContext } from "react";
import type { ViewerRole } from "../../domain/types";

export type RoleContextValue = {
  role: ViewerRole;
  setRole: (role: ViewerRole) => void;
};

export const RoleContext = createContext<RoleContextValue | null>(null);
