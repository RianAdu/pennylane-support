import Box from "@mui/material/Box";
import { memo, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { CODE_FONT } from "../../theme/theme";

// A heading typed in a post is not a heading of the page: it would break the page's outline for a screen reader.
// It keeps its weight and becomes a paragraph.
const PostHeading = ({ children }: { children?: ReactNode }) => {
  return (
    <p>
      <strong>{children}</strong>
    </p>
  );
};

const components: Components = {
  h1: PostHeading,
  h2: PostHeading,
  h3: PostHeading,
  h4: PostHeading,
  h5: PostHeading,
  h6: PostHeading,
  // A link someone typed leads off the site: the page it opens learns nothing about where the reader came from.
  a: ({ href, children }) => (
    <a href={href} rel="noreferrer nofollow">
      {children}
    </a>
  ),
};

const MarkdownComponent = ({ children }: { children: string }) => {
  return (
    <Box
      sx={{
        // About 72 characters to a line.
        maxWidth: "68ch",
        overflowWrap: "anywhere",
        "& p, & ul, & ol, & pre, & blockquote": { my: 1.5 },
        "& > :first-of-type": { mt: 0 },
        "& > :last-of-type": { mb: 0 },
        "& ul, & ol": { pl: 3 },
        "& li + li": { mt: 0.5 },
        "& a": { color: "primary.main", textUnderlineOffset: "0.15em" },
        "& blockquote": { mx: 0, pl: 2, borderLeft: 3, borderColor: "divider", color: "text.secondary" },
        "& hr": { my: 2, border: 0, borderTop: 1, borderColor: "divider" },
        "& code": {
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          bgcolor: "surface",
          fontFamily: CODE_FONT,
          fontSize: "0.875rem",
        },
        "& pre": {
          p: 2,
          overflowX: "auto",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "surface",
          lineHeight: 1.6,
        },
        "& pre code": { p: 0, bgcolor: "transparent" },
      }}
    >
      <ReactMarkdown components={components} disallowedElements={["img"]}>
        {children}
      </ReactMarkdown>
    </Box>
  );
};

/**
 * A post's text as Markdown. Raw HTML is never rendered (react-markdown shows it as text) and images are left out,
 * so nothing a person types can run a script or load a file from another server. Memoized: parsing is the costly
 * part of a post, and the same text gives the same result.
 */
export const Markdown = memo(MarkdownComponent);
