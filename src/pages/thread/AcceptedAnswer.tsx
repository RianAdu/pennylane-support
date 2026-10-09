import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { memo } from "react";
import type { Post } from "../../domain/types";
import { Markdown } from "./Markdown";
import { Byline } from "./shared/Byline";
import { Helpful } from "./shared/Helpful";
import { gutterRow, marker } from "./Thread.styles";

/** The room the tint takes past the reading column on each side, so A: stands on the same line as Q:. */
const BLEED = 16;
const EDGE = 3;

type AcceptedAnswerProps = {
  post: Post;
  /** The asker answered their own question. */
  solvedByAsker: boolean;
};

const AcceptedAnswerComponent = ({ post, solvedByAsker }: AcceptedAnswerProps) => {
  return (
    <Box
      component="section"
      aria-labelledby="accepted-answer"
      sx={{
        ...gutterRow,
        mx: `-${BLEED}px`,
        pl: `${BLEED - EDGE}px`,
        pr: `${BLEED}px`,
        py: 2.5,
        borderLeft: EDGE,
        borderColor: "solved.main",
        borderRadius: { md: "0 8px 8px 0" },
        bgcolor: "solved.tint",
      }}
    >
      <Box aria-hidden sx={{ ...marker, display: { xs: "none", md: "block" }, color: "solved.main" }}>
        A:
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          id="accepted-answer"
          component="h2"
          variant="body2"
          sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.25, color: "solved.main", fontWeight: 700 }}
        >
          <Box component="span" aria-hidden sx={{ display: { md: "none" }, mr: 0.5, typography: "h2" }}>
            A:
          </Box>
          <CheckIcon aria-hidden sx={{ fontSize: 18 }} />
          {solvedByAsker ? "Solved by the asker" : "Accepted answer"}
        </Typography>
        <Byline post={post} verb="Answered" avatarInLine />
        <Box sx={{ mt: 1.25 }}>
          <Markdown>{post.content}</Markdown>
        </Box>
        <Helpful count={post.helpful} />
      </Box>
    </Box>
  );
};

/**
 * The accepted answer: the one filled block on the page, so the eye lands on it. The bar on its edge is the device
 * the navigation uses for "you are here". Memoized for the same reason as a reply.
 */
export const AcceptedAnswer = memo(AcceptedAnswerComponent);
