import { createTheme } from "@mui/material/styles";

// The colour tokens from AGENTS.md. Every text pair below was checked against WCAG AA (4.5:1); the ratios are in
// DECISIONS.md (D50).
const INK = "#1E2533";
const PAPER = "#FBFBFD";
const ACTION = "#2D4FA8";
const SOLVED = "#157A55";
const WAITING = "#9A5B00";
const RULES = "#DDE1E7";
/** Secondary text: counts, hints, placeholders. */
const MUTED = "#566074";
/** The edge of a field or an outlined control. `RULES` is too faint to mark something you can type in (needs 3:1). */
const INPUT_BORDER = "#737D8F";
/** The selected navigation row: action at 10% on paper. */
const SELECTED = "#E6EAF5";
/** A hovered row: ink at 5% on paper. */
const HOVER = "#F0F0F3";
/** Chip backgrounds: the status colour at 6% on paper. At 10% the solved text falls below 4.5:1. */
const SOLVED_TINT = "#EDF3F3";
const WAITING_TINT = "#F5F1EE";

const UI_FONT = '"Atkinson Hyperlegible", system-ui, sans-serif';
export const CODE_FONT = '"JetBrains Mono", ui-monospace, monospace';

type StatusColor = {
  /** Text and border. */
  main: string;
  /** Chip background. */
  tint: string;
};

declare module "@mui/material/styles" {
  /* eslint-disable @typescript-eslint/consistent-type-definitions -- MUI's palette can only be extended by declaration merging, which needs an interface */
  interface Palette {
    solved: StatusColor;
    waiting: StatusColor;
    inputBorder: string;
  }
  interface PaletteOptions {
    solved: StatusColor;
    waiting: StatusColor;
    inputBorder: string;
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
    background: { default: PAPER, paper: PAPER },
    divider: RULES,
    action: { hover: HOVER, selected: SELECTED },
    solved: { main: SOLVED, tint: SOLVED_TINT },
    waiting: { main: WAITING, tint: WAITING_TINT },
    inputBorder: INPUT_BORDER,
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: UI_FONT,
    h1: { fontSize: "1.75rem", lineHeight: 36 / 28, fontWeight: 700 },
    h2: { fontSize: "1.25rem", lineHeight: 28 / 20, fontWeight: 700 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    body2: { fontSize: "0.875rem", lineHeight: 20 / 14 },
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
  },
});
