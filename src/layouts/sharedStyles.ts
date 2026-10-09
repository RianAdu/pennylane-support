/**
 * `sx` for text that only a screen reader should get. The sizes are strings on purpose: as numbers, `sx` reads
 * `width: 1` as 100% and `margin: -1` as one spacing unit.
 */
export const visuallyHidden = {
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/** `sx` for a `ul` that is a list to a screen reader but carries no bullets or indent. */
export const listReset = { listStyle: "none", m: 0, p: 0 } as const;
