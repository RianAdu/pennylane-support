import type { SxProps, Theme } from "@mui/material/styles";

// Every `sx` object of the row, its vote block and its skeleton, so the components read as structure.

/** `sx` for what only shows from 900 px: the vote block and the avatar. */
export const fromMdSx = { display: { xs: "none", md: "block" } } as const;

/** `sx` for what only shows below 900 px. */
export const belowMdSx = { display: { md: "none" } } as const;

// One geometry for the row and its skeleton, so nothing moves when the rows arrive. From 900 px: a vote column, an
// avatar column and the text. Below that the two columns go and the votes join the status line.
export const rowSx = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "48px 36px minmax(0, 1fr)" },
  columnGap: 2,
  // On a phone the rules run to the screen's edges. From 900 px they keep to the column, in line with the header.
  px: { xs: 2, md: 0 },
  mx: { xs: -2, md: 0 },
  py: { xs: 2, md: 2.5 },
  borderBottom: 1,
  borderColor: "divider",
} as const;

/** The row itself: `rowSx` plus what answers the pointer and the keyboard. */
export const interactiveRowSx: SxProps<Theme> = (theme) => ({
  ...rowSx,
  transition: "background-color 120ms, box-shadow 120ms",
  "&:hover": {
    bgcolor: "action.hover",
    // From 900 px the tint reaches a little past the column on both sides, so the text does not touch its edge.
    [theme.breakpoints.up("md")]: {
      boxShadow: `-12px 0 0 ${theme.palette.action.hover}, 12px 0 0 ${theme.palette.action.hover}`,
    },
  },
  "&:hover .votes": { bgcolor: "background.paper" },
  "&:hover .title": { color: "primary.main" },
  // The link covers the row, so the ring goes around the row.
  "&:has(.title:focus-visible)": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2,
    borderRadius: 1,
    [theme.breakpoints.up("md")]: { outlineOffset: 4 },
  },
});

export const textSx = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  gridTemplateAreas: {
    xs: `"title title title" "excerpt excerpt excerpt" "status votes replies" "challenge challenge date" "triage triage triage"`,
    md: `"title title replies" "excerpt excerpt excerpt" "status challenge date" "triage triage triage"`,
  },
  columnGap: 1.5,
  alignItems: "center",
} as const;

export const titleSx = { gridArea: "title", overflowWrap: "anywhere" } as const;

/** The title's link, stretched over the whole row. The row draws the focus ring, so the link draws none. */
export const titleLinkSx = {
  transition: "color 120ms",
  outline: "none",
  "&::after": { content: '""', position: "absolute", inset: 0 },
} as const;

/** One line of excerpt on a phone, two from 900 px. */
export const excerptSx = {
  gridArea: "excerpt",
  mt: 0.5,
  mb: 1.25,
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: { xs: 1, md: 2 },
  overflow: "hidden",
} as const;

export const statusSx = { gridArea: "status", display: "flex" } as const;

/** Below 900 px the votes sit in the status line, since the vote block is gone. */
export const inlineVotesSx = {
  gridArea: "votes",
  display: { xs: "inline-flex", md: "none" },
  alignItems: "center",
  fontWeight: 700,
} as const;

export const inlineVotesIconSx = { fontSize: 18, color: "text.secondary" } as const;

export const repliesSx = {
  gridArea: "replies",
  justifySelf: "end",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  whiteSpace: "nowrap",
} as const;

export const repliesIconSx = { fontSize: 15 } as const;

export const challengeSx = {
  gridArea: "challenge",
  mt: { xs: 1, md: 0 },
  fontSize: { xs: "0.8125rem", md: "0.9375rem" },
} as const;

export const challengeIconSx = { fontSize: 16, mr: 0.75, verticalAlign: "-3px", color: "text.secondary" } as const;

export const dateSx = { gridArea: "date", justifySelf: "end", mt: { xs: 1, md: 0 }, whiteSpace: "nowrap" } as const;

export const triageSx = { gridArea: "triage", display: "flex", mt: 0.75 } as const;

/** Votes are display only, so this is a quiet block with no edge: nothing about it says "press me". */
export const voteBlockSx = {
  display: { xs: "none", md: "flex" },
  flexDirection: "column",
  alignItems: "center",
  alignSelf: "start",
  pt: 0.25,
  pb: 0.75,
  borderRadius: 1,
  bgcolor: "surface",
  fontWeight: 700,
  lineHeight: 1.2,
  transition: "background-color 120ms",
} as const;

export const voteBlockIconSx = { fontSize: 20, color: "text.secondary" } as const;

// The skeleton's lines, by the gap above each.
export const skeletonExcerptSx = { mt: 0.5 } as const;
export const skeletonStatusSx = { mt: 1.25 } as const;
export const skeletonPhoneLineSx = { ...belowMdSx, mt: 1 } as const;
