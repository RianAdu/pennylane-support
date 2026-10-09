import ListItemButton from "@mui/material/ListItemButton";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import { Link } from "react-router";

type NavRowProps = {
  to: string;
  /** This row is the page the viewer is on. */
  current: boolean;
  /** A section row (Community, Challenges, Insights) rather than a category under one. */
  section?: boolean;
  /** A section's icon. Decoration: the label beside it is the name. */
  icon?: ReactNode;
  onNavigate?: () => void;
  children: ReactNode;
};

/** One link in the navigation. */
export const NavRow = ({ to, current, section = false, icon, onNavigate, children }: NavRowProps) => {
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
        pl: section ? 1.5 : 5.5,
        pr: 1.5,
        borderRadius: 1,
        justifyContent: section ? "flex-start" : "space-between",
        gap: 1.5,
        fontSize: section ? "1rem" : "0.9375rem",
        fontWeight: section || current ? 700 : 400,
        transition: "background-color 120ms",
        color: section || current ? "text.primary" : "text.secondary",
        "& .MuiSvgIcon-root": { fontSize: 20, color: current ? "primary.main" : "text.secondary" },
        // The navigation sits on the canvas, where the list's hover tint would not show.
        "&:hover": { bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06), color: "text.primary" },
        // The current row is a piece of the sheet: white on the canvas, with a hairline edge.
        "&.Mui-selected, &.Mui-selected:hover": {
          bgcolor: "background.paper",
          boxShadow: (theme) => `0 0 0 1px ${theme.palette.divider}`,
        },
        // A bar on the leading edge marks the current row, so it is not told apart by a tint alone.
        "&.Mui-selected::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: 2,
          bgcolor: "primary.main",
        },
      }}
    >
      {icon}
      {children}
    </ListItemButton>
  );
};
