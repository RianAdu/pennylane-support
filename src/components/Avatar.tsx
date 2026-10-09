import Box from "@mui/material/Box";

const SEPARATORS = /[\s._-]+/;

/** "error_fixer" gives EF; a name of one word gives its first two letters. */
const initialsOf = (name: string): string => {
  const words = name.split(SEPARATORS).filter((word) => word !== "");
  const [first = "", second] = words;
  const letters = second === undefined ? first.slice(0, 2) : `${first.charAt(0)}${second.charAt(0)}`;
  return letters.toUpperCase();
};

/** A small, stable number from a name, so one person keeps one colour on every screen. */
const hashOf = (name: string): number => {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 9973;
  }
  return hash;
};

type AvatarProps = {
  /** The username the initials and the colour come from. */
  name: string;
  size?: number;
};

/** Initials on a tint. Decoration: the author's name is always written beside it or carried by the row. */
export const Avatar = ({ name, size = 36 }: AvatarProps) => {
  return (
    <Box
      aria-hidden
      sx={{
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: (theme) => theme.palette.avatarTints[hashOf(name) % theme.palette.avatarTints.length],
        color: "text.primary",
        fontSize: size * 0.36,
        fontWeight: 700,
        letterSpacing: "0.02em",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {initialsOf(name)}
    </Box>
  );
};
