import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";

type BrandMarkProps = {
  /** Height in pixels; the width follows. */
  size?: number;
  /** One quiet colour for the whole mark, for where it is a backdrop rather than the brand. */
  muted?: boolean;
  /** On the top bar: the ket takes the bar's text colour and the question its light accent. */
  onDark?: boolean;
};

const questionColor = (theme: Theme, muted: boolean, onDark: boolean): string => {
  if (muted) {
    return "currentColor";
  }
  return onDark ? theme.palette.topBar.accent : theme.palette.primary.main;
};

/**
 * The mark: a question held in a ket, |?⟩. A ket is how quantum computing writes a state, so it reads as "a question
 * about quantum" to the people this is for. Decoration only: the name beside it is the accessible label.
 */
export const BrandMark = ({ size = 24, muted = false, onDark = false }: BrandMarkProps) => {
  return (
    <Box
      component="svg"
      viewBox="0 0 28 24"
      aria-hidden
      focusable="false"
      sx={{
        display: "block",
        flexShrink: 0,
        height: size,
        width: (size * 28) / 24,
        fill: "none",
        strokeWidth: 2.4,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        color: muted ? "divider" : onDark ? "inherit" : "text.primary",
      }}
    >
      <path d="M3 2v20M19 2l6 10-6 10" stroke="currentColor" />
      <Box
        component="path"
        d="M8.2 8.4a3.4 3.4 0 1 1 5.3 2.8c-1.1.75-1.9 1.4-1.9 2.9"
        sx={{ stroke: (theme) => questionColor(theme, muted, onDark) }}
      />
      <Box
        component="circle"
        cx="11.6"
        cy="18.4"
        r="1.5"
        sx={{ stroke: "none", fill: (theme) => questionColor(theme, muted, onDark) }}
      />
    </Box>
  );
};
