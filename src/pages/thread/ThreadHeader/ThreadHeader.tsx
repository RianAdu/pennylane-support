import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router";
import type { ChallengeDetail, ConversationDetail } from "../../../api/contract";
import { StatusChip } from "../../../components/StatusChip";
import { TriageLine } from "../../../components/TriageLine";
import type { Post } from "../../../domain/types";
import { listReset, visuallyHidden } from "../../../layouts/shared/sharedStyles";
import { plural } from "../../../utils/plural";
import { AboutChallenge, challengeName, challengeQuestionsHref } from "../AboutChallenge";
import { Markdown } from "../Markdown";
import { Byline } from "../shared/Byline";
import { besideGutter, GUTTER, marker } from "../Thread.styles";

type ThreadHeaderProps = {
  conversation: ConversationDetail;
  /** The opening post: the question in the asker's words. */
  question: Post;
  challenge: UseQueryResult<ChallengeDetail>;
  /** The admin's ⋯ menu, when the viewer may use it. */
  menu?: ReactNode;
};

/** The question: Q:, the title, who asked and when, where the thread stands, and the question itself. */
export const ThreadHeader = ({ conversation, question, challenge, menu }: ThreadHeaderProps) => {
  const { title, status, acceptedPostId, tags, priority, assignee } = conversation;

  return (
    <Box component="header">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "auto minmax(0, 1fr) auto", md: `${GUTTER}px minmax(0, 1fr) auto` },
          columnGap: { xs: 1.25, md: 0 },
          alignItems: "start",
        }}
      >
        <Box aria-hidden sx={marker}>
          Q:
        </Box>
        <Typography
          variant="h1"
          sx={{ fontSize: marker.fontSize, lineHeight: marker.lineHeight, overflowWrap: "anywhere" }}
        >
          <Box component="span" sx={visuallyHidden}>
            Question:
          </Box>{" "}
          {title}
        </Typography>
        {menu !== undefined && <Box sx={{ ml: 2, mt: { md: -0.25 } }}>{menu}</Box>}
      </Box>
      <Box sx={{ ...besideGutter, mt: 1.5 }}>
        <Byline post={question} verb="Asked" avatarInLine />
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1.5, rowGap: 1, mt: 1.5 }}>
          <StatusChip status={status} hasAcceptedAnswer={acceptedPostId !== null} />
          {/* From 1200 px the challenge is named here and described in the rail. Below that the strip does both. */}
          {challenge.data !== undefined && (
            <Typography variant="body2" sx={{ display: { xs: "none", lg: "block" }, minWidth: 0 }}>
              <ExtensionOutlinedIcon
                aria-hidden
                sx={{ fontSize: 16, mr: 0.75, verticalAlign: "-3px", color: "text.secondary" }}
              />
              <Box component="span" sx={visuallyHidden}>
                Challenge:{" "}
              </Box>
              <MuiLink component={Link} to={challengeQuestionsHref(challenge.data.id)} color="text.primary">
                {challengeName(challenge.data)}
              </MuiLink>
              <Box component="span" sx={{ ml: 1, color: "text.secondary" }}>
                {challenge.data.difficulty}
              </Box>
            </Typography>
          )}
          {tags.length > 0 && (
            <Box component="ul" aria-label="Tags" sx={{ ...listReset, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {tags.map((tag) => (
                <Box
                  component="li"
                  key={tag}
                  sx={{
                    px: 1,
                    border: 1,
                    borderColor: "neutral.edge",
                    borderRadius: 0.5,
                    typography: "caption",
                    lineHeight: "22px",
                    color: "text.secondary",
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Box>
          )}
        </Box>
        {priority !== undefined && (
          <Box sx={{ mt: 1 }}>
            <TriageLine priority={priority} assignee={assignee} />
          </Box>
        )}
        <Box sx={{ display: { lg: "none" }, mt: 2 }}>
          <AboutChallenge challenge={challenge} variant="strip" />
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <Markdown>{question.content}</Markdown>
        </Box>
        {question.upvotes > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 2, ml: -0.5 }}
          >
            <KeyboardArrowUpIcon aria-hidden sx={{ fontSize: 20 }} />
            {plural(question.upvotes, "person has", "people have")} this question too
          </Typography>
        )}
      </Box>
    </Box>
  );
};
