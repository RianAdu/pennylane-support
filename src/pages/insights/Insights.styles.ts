import type { SxProps, Theme } from "@mui/material/styles";

// The `sx` objects of the Insights page's parts, so the components read as structure.

export const sectionSx = { mt: { xs: 5, md: 6 } } as const;

/** The line under a section's heading that says what the figures below it show. */
export const summarySx = { mt: 0.5, mb: 2, maxWidth: "64ch" } as const;

// The tiles are one ruled strip, not four boxes: figures side by side with a rule between neighbours. Four across
// from 600 px; below that two by two, with the rules making a cross.
export const tilesSx: SxProps<Theme> = (theme) => ({
  display: "grid",
  m: 0,
  borderTop: 1,
  borderBottom: 1,
  borderColor: "divider",
  "& > div": { py: 2.5, px: { xs: 2, md: 2.5 } },
  // The columns are set inside the two media blocks: a responsive value here would be written under the same
  // media key as the block below and be replaced by it.
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    "& > div + div": { borderLeft: `1px solid ${theme.palette.divider}` },
    // The first figure starts on the page's left edge, in line with the headings.
    "& > div:first-of-type": { paddingLeft: 0 },
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    "& > div:nth-of-type(odd)": { paddingLeft: 0 },
    "& > div:nth-of-type(even)": { borderLeft: `1px solid ${theme.palette.divider}` },
    "& > div:nth-of-type(n + 3)": { borderTop: `1px solid ${theme.palette.divider}` },
  },
});

export const tileFigureSx = { m: 0, mt: 0.5, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as const;

// One row of the ranking: its place, the challenge, the bar, then the two figures as text. Below 600 px the
// challenge takes the first line and the bar and figures the second.
export const struggleRowSx: SxProps<Theme> = (theme) => ({
  position: "relative",
  display: "grid",
  gridTemplateColumns: { xs: "24px minmax(0, 1fr) auto auto", sm: "24px minmax(0, 1fr) 120px 56px 116px" },
  gridTemplateAreas: {
    xs: `"rank name name name" ". bar open completed"`,
    sm: `"rank name bar open completed"`,
  },
  columnGap: 2,
  rowGap: 1,
  alignItems: "center",
  py: 1.75,
  borderBottom: 1,
  borderColor: "divider",
  transition: "background-color 120ms, box-shadow 120ms",
  "&:hover": {
    bgcolor: "action.hover",
    [theme.breakpoints.up("md")]: {
      boxShadow: `-12px 0 0 ${theme.palette.action.hover}, 12px 0 0 ${theme.palette.action.hover}`,
    },
  },
  "&:hover .name": { color: "primary.main" },
  // The link covers the row, so the ring goes around the row.
  "&:has(a:focus-visible)": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2,
    borderRadius: 1,
    [theme.breakpoints.up("md")]: { outlineOffset: 4 },
  },
});

/** The row's link: the challenge's name is its text, and it is stretched over the whole row. */
export const struggleLinkSx = {
  gridArea: "name",
  minWidth: 0,
  color: "text.primary",
  textDecoration: "none",
  outline: "none",
  "&::after": { content: '""', position: "absolute", inset: 0 },
} as const;

export const barTrackSx = {
  gridArea: "bar",
  height: 8,
  borderRadius: 4,
  bgcolor: "surface",
  overflow: "hidden",
} as const;

export const figureSx = { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as const;

export const tableSx = {
  mt: 1.5,
  borderCollapse: "collapse",
  fontSize: "0.9375rem",
  fontVariantNumeric: "tabular-nums",
  "& th, & td": { py: 0.75, pr: 4, textAlign: "left", borderBottom: 1, borderColor: "divider" },
  "& td:last-of-type, & th:last-of-type": { pr: 0, textAlign: "right" },
  "& thead th": { color: "text.secondary", fontWeight: 400 },
  "& tbody th": { fontWeight: 400 },
} as const;

/** The control that opens the table. It reads as a link, since it shows more of the same page. */
export const tableToggleSx = {
  display: "inline-block",
  py: 1,
  color: "primary.main",
  fontWeight: 700,
  fontSize: "0.9375rem",
  cursor: "pointer",
  borderRadius: 1,
} as const;
