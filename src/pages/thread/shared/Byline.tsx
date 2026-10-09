import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Avatar } from "../../../components/Avatar";
import type { Post, PostRole } from "../../../domain/types";
import { formatDate } from "../../../utils/formatDate";

// The role the author held when posting. A learner gets no badge: the badge marks an answer from someone who helps
// for PennyLane.
const ROLE_LABELS: Record<PostRole, string | undefined> = {
  learner: undefined,
  mentor: "Mentor",
  staff: "Staff",
  support: "Support",
};

type BylineProps = {
  post: Post;
  /** What the author did, before the date: "Asked", "Answered", "Replied". */
  verb: string;
  /** The avatar sits in the line at every width, because the gutter beside this post holds a marker instead. */
  avatarInLine?: boolean;
};

/** Who wrote a post and when. A reply's avatar sits here below 900 px, and in the gutter from there on. */
export const Byline = ({ post, verb, avatarInLine = false }: BylineProps) => {
  const roleLabel = ROLE_LABELS[post.roleAtPosting];
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1, rowGap: 0.25 }}>
      <Box sx={{ display: avatarInLine ? "block" : { md: "none" } }}>
        <Avatar name={post.author} size={28} />
      </Box>
      <Typography component="span" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
        {post.author}
      </Typography>
      {roleLabel !== undefined && (
        <Box
          component="span"
          sx={{
            px: 0.75,
            border: 1,
            borderColor: "neutral.edge",
            borderRadius: 0.5,
            bgcolor: "background.paper",
            typography: "caption",
            fontWeight: 700,
          }}
        >
          {roleLabel}
        </Box>
      )}
      <Typography component="span" variant="caption" color="text.secondary">
        {verb} <time dateTime={post.postedAt}>{formatDate(post.postedAt)}</time>
      </Typography>
    </Box>
  );
};
