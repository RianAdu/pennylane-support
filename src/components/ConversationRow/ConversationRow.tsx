import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";
import type { ConversationSummary } from "../../api/contract";
import { visuallyHidden } from "../../layouts/shared/sharedStyles";
import { formatDate } from "../../utils/formatDate";
import { plural } from "../../utils/plural";
import { Avatar } from "../Avatar";
import { StatusChip } from "../StatusChip";
import { TriageLine } from "../TriageLine";
import {
  challengeIconSx,
  challengeSx,
  dateSx,
  excerptSx,
  fromMdSx,
  inlineVotesIconSx,
  inlineVotesSx,
  interactiveRowSx,
  repliesIconSx,
  repliesSx,
  statusSx,
  textSx,
  titleLinkSx,
  titleSx,
  triageSx,
} from "./ConversationRow.styles";
import { Votes } from "./Votes";

/** One thread in a list: enough to decide whether to open it. The whole row is the link's target. */
export const ConversationRow = ({ conversation }: { conversation: ConversationSummary }) => {
  const { id, title, author, excerpt, status, hasAcceptedAnswer, votes, replyCount, challengeTitle, lastActivityAt } =
    conversation;

  return (
    <Box component="li" sx={interactiveRowSx}>
      <Votes count={votes} />
      <Box sx={fromMdSx}>
        <Avatar name={author} />
      </Box>
      <Box sx={textSx}>
        <Typography variant="subtitle1" component="h2" sx={titleSx}>
          <MuiLink
            className="title"
            component={Link}
            to={`/threads/${encodeURIComponent(id)}`}
            color="text.primary"
            underline="none"
            sx={titleLinkSx}
          >
            {title}
          </MuiLink>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={excerptSx}>
          {excerpt}
        </Typography>
        <Box sx={statusSx}>
          <StatusChip status={status} hasAcceptedAnswer={hasAcceptedAnswer} />
        </Box>
        <Typography variant="caption" aria-hidden sx={inlineVotesSx}>
          <KeyboardArrowUpIcon sx={inlineVotesIconSx} />
          {votes}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={repliesSx}>
          <ChatBubbleOutlineIcon aria-hidden sx={repliesIconSx} />
          {plural(replyCount, "reply", "replies")}
        </Typography>
        <Typography variant="body2" noWrap sx={challengeSx}>
          <ExtensionOutlinedIcon aria-hidden sx={challengeIconSx} />
          <Box component="span" sx={visuallyHidden}>
            Challenge:{" "}
          </Box>
          {challengeTitle}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={dateSx}>
          <Box component="span" sx={visuallyHidden}>
            Last activity{" "}
          </Box>
          <time dateTime={lastActivityAt}>{formatDate(lastActivityAt)}</time>
        </Typography>
        {conversation.priority !== undefined && (
          <Box sx={triageSx}>
            <TriageLine priority={conversation.priority} assignee={conversation.assignee} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
