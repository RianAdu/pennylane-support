import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import { Link } from "react-router";
import { BrandMark } from "../components/BrandMark";
import { RoleSwitcher } from "../components/RoleSwitcher";
import { SearchField } from "./SearchField";
import { visuallyHidden } from "./shared/sharedStyles";
import { SIDEBAR_WIDTH, TOP_BAR_HEIGHT } from "./shared/sharedSizes";

type TopBarProps = {
  /** The sidebar is not on screen at any width (the thread page), so the menu button always shows. */
  menuAtEveryWidth: boolean;
  onOpenMenu: () => void;
};

export const TopBar = ({ menuAtEveryWidth, onOpenMenu }: TopBarProps) => {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: "appBar",
        display: "flex",
        alignItems: "center",
        gap: 1,
        height: TOP_BAR_HEIGHT,
        px: { xs: 1, md: 3 },
        bgcolor: "topBar.main",
        color: "common.white",
        // Action blue does not show on ink, so the ring is the bar's light accent here. The selector is doubled to
        // outrank the theme's own ring on buttons, which would otherwise keep theirs in action blue.
        "&& :focus-visible, && .Mui-focusVisible": { outlineColor: (theme) => theme.palette.topBar.accent },
      }}
    >
      <IconButton
        aria-label="Open menu"
        color="inherit"
        onClick={onOpenMenu}
        sx={{ display: menuAtEveryWidth ? "inline-flex" : { xs: "inline-flex", md: "none" } }}
      >
        <MenuIcon aria-hidden />
      </IconButton>
      {/* At the sidebar's width, so the search field starts where the main area starts. */}
      <Box sx={{ flexShrink: 0, width: menuAtEveryWidth ? "auto" : { md: SIDEBAR_WIDTH - 24 }, pr: { md: 2 } }}>
        <MuiLink
          component={Link}
          to="/"
          color="inherit"
          underline="none"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.25,
            fontSize: "1.125rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            borderRadius: 0.5,
          }}
        >
          <BrandMark size={22} onDark />
          <span>
            PennyLane
            {/* On a phone the second word gives its room to the search field. A screen reader still gets it. */}
            <Box component="span" sx={(theme) => ({ [theme.breakpoints.down("sm")]: visuallyHidden })}>
              {" "}
              Support
            </Box>
          </span>
        </MuiLink>
      </Box>
      <SearchField />
      <Box sx={{ display: { xs: "none", md: "block" }, ml: "auto", pl: 2 }}>
        <RoleSwitcher onDark />
      </Box>
    </Box>
  );
};
