import { alpha, createTheme } from "@mui/material/styles";

// The colour tokens from AGENTS.md. Every text pair below was checked against WCAG AA (4.5:1); the ratios are in
// DECISIONS.md (D50, D56).
const INK = "#1E2533";
/** The sheet a page is set on, and menus. */
const PAPER = "#FFFFFF";
/** The layer behind the sheet and the navigation, so the page reads as the top layer. Also the vote block. */
const CANVAS = "#F4F5F9";
const ACTION = "#3D45C4";
const SOLVED = "#157A55";
const WAITING = "#9A5B00";
const RULES = "#DDE1E7";
/** Secondary text: counts, hints, placeholders. */
const MUTED = "#566074";
/** The edge of a field or an outlined control. `RULES` is too faint to mark something you can type in (needs 3:1). */
const INPUT_BORDER = "#737D8F";
/** The current page in the pager: action at 10% on paper. */
const SELECTED = "#ECECF9";
/** A hovered row: ink at 5% on paper. */
const HOVER = "#F0F0F3";
/** The top bar is ink, the one dark layer. These are the colours of what sits on it. */
const TOP_BAR = {
  main: INK,
  /** The search field: white at 10% on ink. */
  field: "#343B47",
  /** The edge of a control on the bar. */
  edge: "#8A93A8",
  /** Placeholder and icon in the field. */
  hint: "#B8C0D0",
  /** The focus ring and the brand mark's question: action is too dark to show on ink. */
  accent: "#A9B1FF",
};
/** The sheet's lift off the canvas: two soft layers of ink, no hard edge. */
export const SHEET_SHADOW = `0 1px 2px ${alpha(INK, 0.04)}, 0 12px 32px ${alpha(INK, 0.05)}`;
/** Chip backgrounds: the status colour at 6% on paper. At 10% the solved text falls below 4.5:1. */
const SOLVED_TINT = "#EDF3F3";
const WAITING_TINT = "#F5F1EE";
/** Chip edges: the status colour at 35% on paper. Decoration only: the word carries the status. */
const SOLVED_EDGE = "#AACEC2";
const WAITING_EDGE = "#D9C3A4";
const NEUTRAL_EDGE = "#C1C5CD";
/** Avatar backgrounds, one per asker by a hash of the name. Pale enough that ink on each is above 12:1. */
const AVATAR_TINTS = ["#E3E8F4", "#E1EFE9", "#F3E9DC", "#EDE4F1", "#F5E3E3", "#DFEDF1"];

const UI_FONT = '"Atkinson Hyperlegible", system-ui, sans-serif';
export const CODE_FONT = '"JetBrains Mono", ui-monospace, monospace';

type StatusColor = {
  /** Text. */
  main: string;
  /** Chip background. */
  tint: string;
  /** Chip edge. */
  edge: string;
};

declare module "@mui/material/styles" {
  /* eslint-disable @typescript-eslint/consistent-type-definitions -- MUI's palette can only be extended by declaration merging, which needs an interface */
  interface Palette {
    solved: StatusColor;
    waiting: StatusColor;
    neutral: StatusColor;
    inputBorder: string;
    surface: string;
    topBar: typeof TOP_BAR;
    avatarTints: string[];
  }
  interface PaletteOptions {
    solved: StatusColor;
    waiting: StatusColor;
    neutral: StatusColor;
    inputBorder: string;
    surface: string;
    topBar: typeof TOP_BAR;
    avatarTints: string[];
  }
  /* eslint-enable @typescript-eslint/consistent-type-definitions */
}

const focusRing = {
  outline: `2px solid ${ACTION}`,
  outlineOffset: 2,
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: ACTION, contrastText: "#FFFFFF" },
    text: { primary: INK, secondary: MUTED },
    background: { default: CANVAS, paper: PAPER },
    divider: RULES,
    action: { hover: HOVER, selected: SELECTED },
    solved: { main: SOLVED, tint: SOLVED_TINT, edge: SOLVED_EDGE },
    waiting: { main: WAITING, tint: WAITING_TINT, edge: WAITING_EDGE },
    neutral: { main: MUTED, tint: HOVER, edge: NEUTRAL_EDGE },
    inputBorder: INPUT_BORDER,
    surface: CANVAS,
    topBar: TOP_BAR,
    avatarTints: AVATAR_TINTS,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: UI_FONT,
    // The scale: 13 for meta, 15 for excerpts and navigation, 16 for body, 17 for a row's title, 20 and 30 for
    // headings. Each step is far enough from the next to be told apart at a glance.
    h1: { fontSize: "1.875rem", lineHeight: 36 / 30, fontWeight: 700, letterSpacing: "-0.015em" },
    h2: { fontSize: "1.25rem", lineHeight: 28 / 20, fontWeight: 700, letterSpacing: "-0.005em" },
    subtitle1: { fontSize: "1.0625rem", lineHeight: 24 / 17, fontWeight: 700 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    body2: { fontSize: "0.9375rem", lineHeight: 22 / 15 },
    caption: { fontSize: "0.8125rem", lineHeight: 18 / 13 },
    button: { fontSize: "1rem", fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // One focus ring for everything that takes keyboard focus.
        ":focus-visible": focusRing,
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiButtonBase: {
      // The ring shows focus; the ripple would be a second, moving signal.
      defaultProps: { disableRipple: true },
      styleOverrides: {
        // ButtonBase resets the outline, so the ring is set again here.
        root: { "&.Mui-focusVisible, &:focus-visible": focusRing },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        // Inside the ring's own row, so a scrolling list cannot clip it.
        root: { "&.Mui-focusVisible, &:focus-visible": { outlineOffset: -2 } },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: { "&::placeholder": { color: MUTED, opacity: 1 } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: INPUT_BORDER },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { paddingInline: 18 },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        // The selected tab is a filled pill; a moving underline would be a second marker.
        indicator: { display: "none" },
        list: { alignItems: "center", gap: 6 },
      },
    },
    MuiTab: {
      styleOverrides: {
        // Sized by its word, not a fixed width, so four tabs fit a phone without scrolling the first out of view.
        root: {
          minWidth: 0,
          minHeight: 36,
          padding: "6px 14px",
          borderRadius: 18,
          fontSize: "0.9375rem",
          fontWeight: 700,
          color: MUTED,
          transition: "background-color 120ms, color 120ms",
          "&:hover": { color: INK, backgroundColor: alpha(INK, 0.06) },
          "&.Mui-selected, &.Mui-selected:hover": { color: PAPER, backgroundColor: INK },
          // Inside the tab's own box: the tab list clips what sticks out of it.
          "&.Mui-focusVisible, &:focus-visible": { outlineOffset: -2 },
          // On the filled pill the ring sits on ink, where action blue does not show.
          "&.Mui-selected.Mui-focusVisible, &.Mui-selected:focus-visible": {
            outlineOffset: -4,
            outlineColor: TOP_BAR.accent,
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: SELECTED, color: ACTION, fontWeight: 700 },
          "&:hover": { backgroundColor: alpha(INK, 0.06) },
        },
      },
    },
  },
});
