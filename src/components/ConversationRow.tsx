import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";
import type { ConversationSummary } from "../api/contract";
import type { Priority } from "../domain/types";
import { visuallyHidden } from "../layouts/shared/sharedStyles";
import { formatDate } from "../utils/formatDate";
import { Avatar } from "./Avatar";
import { StatusChip } from "./StatusChip";

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
  urgent: "Urgent priority",
};

const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`;

// One geometry for the row and its skeleton, so nothing moves when the rows arrive. From 900 px: a vote column, an
// avatar column and the text. Below that the two columns go and the votes join the status line.
const rowSx = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "48px 36px minmax(0, 1fr)" },
  columnGap: 2,
  // On a phone the rules run to the screen's edges. From 900 px they keep to the column, in line with the header.
  px: { xs: 2, md: 0 },
  mx: { xs: -2, md: 0 },
  py: { xs: 2, md: 2.5 },
  borderBottom: 1,
  borderColor: "divider",
} as const;

const textSx = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  gridTemplateAreas: {
    xs: `"title title title" "excerpt excerpt excerpt" "status votes replies" "challenge challenge date" "triage triage triage"`,
    md: `"title title replies" "excerpt excerpt excerpt" "status challenge date" "triage triage triage"`,
  },
  columnGap: 1.5,
  alignItems: "center",
} as const;

const linesSx = (lines: { xs: number; md: number }) => {
  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: lines,
    overflow: "hidden",
  } as const;
};

/** Votes are display only, so this is a quiet block with no edge: nothing about it says "press me". */
const Votes = ({ count }: { count: number }) => {
  return (
    <>
      <Box
        className="votes"
        aria-hidden
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "start",
          pt: 0.25,
          pb: 0.75,
          borderRadius: 1,
          bgcolor: "surface",
          fontWeight: 700,
          lineHeight: 1.2,
          transition: "background-color 120ms",
        }}
      >
        <KeyboardArrowUpIcon sx={{ fontSize: 20, color: "text.secondary" }} />
        {count}
      </Box>
      <Box component="span" sx={visuallyHidden}>
        {plural(count, "person has", "people have")} this question.
      </Box>
    </>
  );
};

/** What only an admin's response carries: why a thread may need attention. */
const Triage = ({ priority, assignee }: { priority: Priority; assignee: string | null | undefined }) => {
  const pressing = priority === "high" || priority === "urgent";
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ gridArea: "triage", display: "flex", flexWrap: "wrap", columnGap: 2, mt: 0.75 }}
    >
      <Box component="span" sx={pressing ? { color: "text.primary", fontWeight: 700 } : undefined}>
        {PRIORITY_LABELS[priority]}
      </Box>
      {assignee === null ? (
        <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
          Unassigned
        </Box>
      ) : (
        <span>Assigned to {assignee}</span>
      )}
    </Typography>
  );
};

/** One thread in a list: enough to decide whether to open it. The whole row is the link's target. */
export const ConversationRow = ({ conversation }: { conversation: ConversationSummary }) => {
  const { id, title, author, excerpt, status, hasAcceptedAnswer, votes, replyCount, challengeTitle, lastActivityAt } =
    conversation;

  return (
    <Box
      component="li"
      sx={(theme) => ({
        ...rowSx,
        transition: "background-color 120ms, box-shadow 120ms",
        "&:hover": {
          bgcolor: "action.hover",
          // From 900 px the tint reaches a little past the column on both sides, so the text does not touch its edge.
          [theme.breakpoints.up("md")]: {
            boxShadow: `-12px 0 0 ${theme.palette.action.hover}, 12px 0 0 ${theme.palette.action.hover}`,
          },
        },
        "&:hover .votes": { bgcolor: "background.paper" },
        "&:hover .title": { color: "primary.main" },
        // The link covers the row, so the ring goes around the row.
        "&:has(.title:focus-visible)": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: -2,
          borderRadius: 1,
          [theme.breakpoints.up("md")]: { outlineOffset: 4 },
        },
      })}
    >
      <Votes count={votes} />
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Avatar name={author} />
      </Box>
      <Box sx={textSx}>
        <Typography variant="subtitle1" component="h2" sx={{ gridArea: "title", overflowWrap: "anywhere" }}>
          <MuiLink
            className="title"
            component={Link}
            to={`/threads/${encodeURIComponent(id)}`}
            color="text.primary"
            underline="none"
            sx={{
              transition: "color 120ms",
              outline: "none",
              "&::after": { content: '""', position: "absolute", inset: 0 },
            }}
          >
            {title}
          </MuiLink>
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ gridArea: "excerpt", mt: 0.5, mb: 1.25, ...linesSx({ xs: 1, md: 2 }) }}
        >
          {excerpt}
        </Typography>
        <Box sx={{ gridArea: "status", display: "flex" }}>
          <StatusChip status={status} hasAcceptedAnswer={hasAcceptedAnswer} />
        </Box>
        <Typography
          variant="caption"
          aria-hidden
          sx={{
            gridArea: "votes",
            display: { xs: "inline-flex", md: "none" },
            alignItems: "center",
            fontWeight: 700,
          }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          {votes}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            gridArea: "replies",
            justifySelf: "end",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            whiteSpace: "nowrap",
          }}
        >
          <ChatBubbleOutlineIcon aria-hidden sx={{ fontSize: 15 }} />
          {plural(replyCount, "reply", "replies")}
        </Typography>
        <Typography
          variant="body2"
          noWrap
          sx={{ gridArea: "challenge", mt: { xs: 1, md: 0 }, fontSize: { xs: "0.8125rem", md: "0.9375rem" } }}
        >
          <ExtensionOutlinedIcon
            aria-hidden
            sx={{ fontSize: 16, mr: 0.75, verticalAlign: "-3px", color: "text.secondary" }}
          />
          <Box component="span" sx={visuallyHidden}>
            Challenge:{" "}
          </Box>
          {challengeTitle}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            gridArea: "date",
            justifySelf: "end",
            mt: { xs: 1, md: 0 },
            whiteSpace: "nowrap",
          }}
        >
          <Box component="span" sx={visuallyHidden}>
            Last activity{" "}
          </Box>
          <time dateTime={lastActivityAt}>{formatDate(lastActivityAt)}</time>
        </Typography>
        {conversation.priority !== undefined && (
          <Triage priority={conversation.priority} assignee={conversation.assignee} />
        )}
      </Box>
    </Box>
  );
};

/** A row that has not arrived yet, in the row's own shape. */
export const ConversationRowSkeleton = () => {
  return (
    <Box component="li" sx={rowSx}>
      <Skeleton variant="rounded" height={48} sx={{ display: { xs: "none", md: "block" } }} />
      <Skeleton variant="circular" width={36} height={36} sx={{ display: { xs: "none", md: "block" } }} />
      <Box>
        <Skeleton width="62%" height={24} />
        <Skeleton height={22} sx={{ mt: 0.5 }} />
        <Skeleton width="80%" height={22} sx={{ display: { xs: "none", md: "block" } }} />
        <Skeleton width="45%" height={24} sx={{ mt: 1.25 }} />
        <Skeleton width="55%" height={18} sx={{ display: { md: "none" }, mt: 1 }} />
      </Box>
    </Box>
  );
};
