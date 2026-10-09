/** The column on the left of the thread, from 900 px: Q:, A: and each reply's avatar sit in it, on one line. */
export const GUTTER = 56;

/** `sx` for what sits beside the gutter: indented by it from 900 px, at the edge below that. */
export const besideGutter = { pl: { md: `${GUTTER}px` } } as const;

/** `sx` for a row with something in the gutter and the text beside it. Below 900 px the gutter is gone. */
export const gutterRow = {
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", md: `${GUTTER}px minmax(0, 1fr)` },
} as const;

/** `sx` for the big Q: and A:. They are type at the page title's size; the words beside them carry the meaning. */
export const marker = {
  typography: "h1",
  fontSize: { xs: "1.25rem", md: "1.875rem" },
  lineHeight: { xs: 28 / 20, md: 36 / 30 },
  userSelect: "none",
} as const;
