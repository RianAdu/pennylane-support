import { useContext } from "react";
import { RoleContext, type RoleContextValue } from "./RoleContext";

export const useRole = (): RoleContextValue => {
  const value = useContext(RoleContext);
  if (value === null) {
    throw new Error("useRole must be used inside a RoleProvider");
  }
  return value;
};
