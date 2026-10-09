import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { Outlet, ScrollRestoration, useMatch } from "react-router";
import { RoleSwitcher } from "../components/RoleSwitcher";
import { SidebarNav } from "./SidebarNav/SidebarNav";
import { SHEET_SHADOW } from "../theme/theme";
import {
  CONTENT_WIDTH,
  RAIL_GAP,
  RAIL_WIDTH,
  SHEET_PADDING,
  SIDEBAR_WIDTH,
  TOP_BAR_HEIGHT,
} from "./shared/sharedSizes";
import { MAIN_ID } from "./hooks/useReturnToMainTop";
import { TopBar } from "./TopBar";

/** The frame around every page: skip link, top bar, navigation and the main landmark. */
export const AppLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  // The thread page gives its width to reading: no sidebar, and the menu button opens the drawer at every width.
  const onThread = useMatch("/threads/:id") !== null;
  const closeMenu = () => setMenuOpen(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <MuiLink
        href={`#${MAIN_ID}`}
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: "tooltip",
          px: 2,
          py: 1,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "inputBorder",
          borderRadius: 1,
          fontWeight: 700,
          // Off screen until the keyboard reaches it.
          transform: "translateY(-200%)",
          "&:focus": { transform: "none" },
        }}
      >
        Skip to main content
      </MuiLink>
      {/* A page opened by a link starts at its top; going back returns to where the viewer was, so a thread opened
          from far down the list leads back to the same row. */}
      <ScrollRestoration />
      <TopBar menuAtEveryWidth={onThread} onOpenMenu={() => setMenuOpen(true)} />
      <Box sx={{ display: "flex", flex: 1 }}>
        {!onThread && (
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              flexShrink: 0,
              width: SIDEBAR_WIDTH,
              position: "sticky",
              top: TOP_BAR_HEIGHT,
              alignSelf: "flex-start",
              height: `calc(100dvh - ${TOP_BAR_HEIGHT}px)`,
              overflowY: "auto",
            }}
          >
            <SidebarNav />
          </Box>
        )}
        <Box
          component="main"
          id={MAIN_ID}
          tabIndex={-1}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            px: { md: 4 },
            pt: { md: 3 },
            pb: { md: 8 },
            // Main takes focus from the skip link and from a new page of a list. The ring goes on the sheet, which is
            // what the viewer sees as the page, and only for keyboard focus.
            outline: "none",
            "&:focus-visible > *": {
              outline: (theme) => `2px solid ${theme.palette.primary.main}`,
              outlineOffset: { xs: -2, md: 2 },
            },
            // The top bar is sticky, so a jump to main (the skip link, a new page of a list) must stop below it.
            scrollMarginTop: TOP_BAR_HEIGHT,
          }}
        >
          {/* The sheet: one reading column on white, centred in the room beside the navigation. On a phone it is
              the whole screen. */}
          <Box
            sx={{
              flex: { xs: 1, md: "none" },
              width: "100%",
              // The thread page has no sidebar, and from 1200 px gives that room to a rail beside the reading column.
              maxWidth: {
                md: CONTENT_WIDTH + 2 * SHEET_PADDING,
                lg: CONTENT_WIDTH + 2 * SHEET_PADDING + (onThread ? RAIL_GAP + RAIL_WIDTH : 0),
              },
              mx: "auto",
              px: { xs: 2, md: `${SHEET_PADDING}px` },
              pt: { xs: 3, md: 5 },
              pb: { xs: 5, md: 4 },
              bgcolor: "background.paper",
              border: { md: 1 },
              borderColor: { md: "divider" },
              borderRadius: { md: 3 },
              boxShadow: { md: SHEET_SHADOW },
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
      <Drawer
        open={menuOpen}
        onClose={closeMenu}
        slotProps={{
          // MUI hands focus back to the menu button as soon as the drawer starts to close, but by default keeps the
          // page behind it aria-hidden until the slide has finished. For that moment the focused button would be
          // hidden from a screen reader, so the page is released at the start of the close instead.
          root: { closeAfterTransition: false },
          paper: {
            "aria-label": "Menu",
            sx: {
              width: SIDEBAR_WIDTH,
              maxWidth: "85vw",
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.default",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            height: TOP_BAR_HEIGHT,
            pl: 3,
            pr: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>Menu</Typography>
          <IconButton aria-label="Close menu" color="inherit" onClick={closeMenu}>
            <CloseIcon aria-hidden />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <SidebarNav onNavigate={closeMenu} />
        </Box>
        {/* The top bar holds the switcher from 900 px; below that it lives here. */}
        <Box sx={{ display: { md: "none" }, flexShrink: 0, p: 2, borderTop: 1, borderColor: "divider" }}>
          <RoleSwitcher fullWidth />
        </Box>
      </Drawer>
    </Box>
  );
};
