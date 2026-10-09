import ListItemButton from "@mui/material/ListItemButton";
import type { ReactNode } from "react";
import { Link } from "react-router";

type NavRowProps = {
  to: string;
  /** This row is the page the viewer is on. */
  current: boolean;
  /** A section row (Community, Challenges, Insights) rather than a category under one. */
  section?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
};

/** One link in the navigation. */
export const NavRow = ({ to, current, section = false, onNavigate, children }: NavRowProps) => {
  return (
    <ListItemButton
      component={Link}
      to={to}
      selected={current}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      sx={{
        minHeight: { xs: 44, md: 40 },
        py: 0.5,
        pl: section ? 1.5 : 3.5,
        pr: 1.5,
        borderRadius: 1,
        justifyContent: "space-between",
        gap: 1.5,
        fontSize: section ? "1rem" : "0.9375rem",
        fontWeight: section || current ? 700 : 400,
        "&.Mui-selected, &.Mui-selected:hover": { bgcolor: "action.selected" },
      }}
    >
      {children}
    </ListItemButton>
  );
};
