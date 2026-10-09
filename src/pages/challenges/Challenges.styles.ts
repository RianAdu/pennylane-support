import { alpha, type SxProps, type Theme } from "@mui/material/styles";
import { SECTION_GAP, SHEET_PADDING, TOP_BAR_HEIGHT } from "../../layouts/shared/sharedSizes";
import { CARD_SHADOW } from "../../theme/theme";

// The `sx` objects of the Challenges page's parts, so the components read as structure.

export const CARD_WIDTH = { xs: 260, sm: 280 } as const;
export const CARD_HEIGHT = 196;

export const categorySx = {
  mt: SECTION_GAP,
  "&:first-of-type": { mt: 1 },
  // A link from the navigation lands here, and must stop below the sticky top bar.
  scrollMarginTop: TOP_BAR_HEIGHT + 16,
} as const;

export const categoryHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  mb: 1.5,
} as const;

/** A round, outlined arrow. At the end of its row it stays in place and focusable, and only looks and says disabled. */
export const arrowSx = {
  width: 36,
  height: 36,
  border: 1,
  borderColor: "inputBorder",
  color: "text.primary",
  "&:hover": { bgcolor: "action.hover" },
  '&[aria-disabled="true"]': { borderColor: "divider", color: "neutral.edge", cursor: "default" },
  '&[aria-disabled="true"]:hover': { bgcolor: "transparent" },
} as const;

// The shelf: one line of white cards on a band of canvas, so each category is one block and the cards read as paper
// on it, the way the page reads on the canvas. The band runs to the sheet's edges, and on a phone to the screen's.
// It scrolls sideways, by the arrows, a swipe, a trackpad or Tab. Its scrollbar is hidden, since the cut card at the
// edge already says there is more.
export const scrollerSx = {
  display: "flex",
  gap: 2,
  listStyle: "none",
  m: 0,
  px: { xs: 2, md: `${SHEET_PADDING}px` },
  py: 4,
  bgcolor: "surface",
  overflowX: "auto",
  scrollSnapType: "x proximity",
  // A card that snaps into place lines up with the heading, not with the band's edge.
  scrollPaddingInline: { xs: 16, md: SHEET_PADDING },
  // Smooth by the stylesheet, so the reduced-motion rule in the theme can turn it off.
  scrollBehavior: "smooth",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
} as const;

/** How wide the shadow at a shelf's edge is. */
const EDGE_SHADOW_WIDTH = 16;

// The frame around the shelf, which carries the band to the sheet's edges. Where cards are hidden past an edge, that
// edge casts a soft shadow onto the shelf, so the cards read as sliding under the page rather than being cut off.
// The shadow is there only while there is something under it: none at the start of a row on the left, none at its
// end on the right.
export const shelfFrameSx: SxProps<Theme> = (theme) => {
  const shadow = alpha(theme.palette.text.primary, 0.09);
  const edge = {
    content: '""',
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 1,
    width: EDGE_SHADOW_WIDTH,
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 160ms",
  } as const;
  return {
    position: "relative",
    mx: { xs: -2, md: `${-SHEET_PADDING}px` },
    "&::before": { ...edge, left: 0, background: `linear-gradient(to right, ${shadow}, transparent)` },
    "&::after": { ...edge, right: 0, background: `linear-gradient(to left, ${shadow}, transparent)` },
    '&[data-more-before="true"]::before': { opacity: 1 },
    '&[data-more-after="true"]::after': { opacity: 1 },
  };
};

export const cardItemSx = { flex: "none", width: CARD_WIDTH, scrollSnapAlign: "start" } as const;

/** The card is one link. A busy one carries a bar on its leading edge, the app's mark for "look here". */
export const cardSx = (busy: boolean): SxProps<Theme> => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  height: CARD_HEIGHT,
  p: 2,
  pb: 1.5,
  overflow: "hidden",
  border: 1,
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: "background.paper",
  // A slight lift off the shelf. The shelf's padding leaves room for it: a scrolling row clips what reaches past it.
  boxShadow: CARD_SHADOW,
  color: "text.primary",
  textDecoration: "none",
  transition: "border-color 120ms",
  "&:hover": { borderColor: "inputBorder" },
  "&:hover .title": { color: "primary.main" },
  // Inside the card's own edge: the shelf clips whatever sticks out of it.
  "&:focus-visible": { outlineOffset: -2 },
  ...(busy && {
    "&::before": {
      content: '""',
      position: "absolute",
      insetBlock: 0,
      left: 0,
      width: 3,
      bgcolor: "waiting.main",
    },
  }),
});

/** Two lines, then an ellipsis. */
export const clampSx = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
} as const;

export const countSx = (busy: boolean, none: boolean) =>
  ({
    alignSelf: "flex-start",
    mt: "auto",
    px: busy ? 1 : 0,
    py: 0.25,
    borderRadius: 1,
    bgcolor: busy ? "waiting.tint" : "transparent",
    color: busy ? "waiting.main" : none ? "text.secondary" : "text.primary",
    fontWeight: busy ? 700 : 400,
  }) as const;
