import Box from "@mui/material/Box";
import { memo } from "react";
import { Avatar } from "../../components/Avatar";
import type { Post } from "../../domain/types";
import { Markdown } from "./Markdown";
import { Byline } from "./shared/Byline";
import { Helpful } from "./shared/Helpful";
import { gutterRow } from "./Thread.styles";

const ReplyItemComponent = ({ post }: { post: Post }) => {
  return (
    <Box component="li" sx={{ ...gutterRow, py: 2.5, borderTop: 1, borderColor: "divider" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Avatar name={post.author} />
      </Box>
      <Box component="article" aria-label={`Reply by ${post.author}`} sx={{ minWidth: 0 }}>
        <Byline post={post} verb="Replied" />
        <Box sx={{ mt: 1 }}>
          <Markdown>{post.content}</Markdown>
        </Box>
        <Helpful count={post.helpful} />
      </Box>
    </Box>
  );
};

/**
 * One reply: a row under a rule, with its author's avatar in the gutter. Memoized: the page renders again whenever a
 * request changes state, and a reply whose post is the same object has nothing new to draw.
 */
export const ReplyItem = memo(ReplyItemComponent);
