import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import OutlinedInput from "@mui/material/OutlinedInput";
import type { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link } from "react-router";
import { RoleSwitcher } from "../components/RoleSwitcher";
import { visuallyHidden } from "./sharedStyles";
import { SIDEBAR_WIDTH, TOP_BAR_HEIGHT } from "./sharedSizes";

type TopBarProps = {
  /** The sidebar is not on screen at any width (the thread page), so the menu button always shows. */
  menuAtEveryWidth: boolean;
  onOpenMenu: () => void;
};

export const TopBar = ({ menuAtEveryWidth, onOpenMenu }: TopBarProps) => {
  // On a phone the field is too narrow for the full hint. The accessible name stays "Search questions" at every width.
  const roomForFullHint = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));

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
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
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
      {/* At the sidebar's width, so the search field lines up with the page content below it. */}
      <Box sx={{ flexShrink: 0, width: menuAtEveryWidth ? "auto" : { md: SIDEBAR_WIDTH - 24 }, pr: { md: 2 } }}>
        <MuiLink
          component={Link}
          to="/"
          color="text.primary"
          underline="none"
          sx={{ fontSize: "1.125rem", fontWeight: 700, whiteSpace: "nowrap" }}
        >
          PennyLane
          {/* Below 375 px the second word gives its room to the search field. A screen reader still gets it. */}
          <Box component="span" sx={{ "@media (max-width: 374.95px)": visuallyHidden }}>
            {" "}
            Support
          </Box>
        </MuiLink>
      </Box>
      {/* Not wired yet: the field shows where search lives, and submitting it does nothing. */}
      <Box
        component="form"
        role="search"
        onSubmit={(event) => event.preventDefault()}
        sx={{ flex: 1, minWidth: 0, maxWidth: 480 }}
      >
        <OutlinedInput
          type="search"
          size="small"
          fullWidth
          placeholder={roomForFullHint ? "Search questions" : "Search"}
          slotProps={{ input: { "aria-label": "Search questions" } }}
        />
      </Box>
      <Box sx={{ display: { xs: "none", md: "block" }, ml: "auto", pl: 2 }}>
        <RoleSwitcher />
      </Box>
    </Box>
  );
};
