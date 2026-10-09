import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useRef } from "react";
import { Link, useParams } from "react-router";
import { useChallenge } from "../../api/hooks/useChallenge";
import { useConversation } from "../../api/hooks/useConversation";
import { useSetStatus } from "../../api/hooks/useSetStatus";
import { ApiError } from "../../api/http";
import { can } from "../../domain/permissions";
import { EmptyState } from "../../error-handling/components/EmptyState";
import { ErrorState } from "../../error-handling/components/ErrorState";
import { InlineError } from "../../error-handling/components/InlineError";
import { listReset, visuallyHidden } from "../../layouts/shared/sharedStyles";
import { RAIL_GAP, RAIL_WIDTH, TOP_BAR_HEIGHT } from "../../layouts/shared/sharedSizes";
import { useRole } from "../../providers/role/useRole";
import { plural } from "../../utils/plural";
import { AboutChallenge } from "./AboutChallenge";
import { AcceptedAnswer } from "./AcceptedAnswer";
import { ReplyItem } from "./ReplyItem";
import { ReplyForm } from "./ReplyForm";
import { STATUS_LABELS, StatusMenu } from "./StatusMenu";
import { Breadcrumb } from "./ThreadHeader/Breadcrumb";
import { ThreadHeader } from "./ThreadHeader/ThreadHeader";
import { ThreadSkeleton } from "./ThreadSkeleton";
import { besideGutter } from "./Thread.styles";

const REPLY_ID = "reply";
/** The height of the Reply bar pinned to the bottom of a phone, which the page must leave free under its last line. */
const REPLY_BAR_HEIGHT = 68;

const repliesHeading = (others: number, hasAccepted: boolean): string | undefined => {
  if (others === 0) {
    return hasAccepted ? undefined : "No replies yet";
  }
  return hasAccepted ? plural(others, "more reply", "more replies") : plural(others, "reply", "replies");
};

export const ThreadPage = () => {
  const { id } = useParams();
  const { role } = useRole();
  const thread = useConversation(id);
  const challenge = useChallenge(thread.data?.challengeId);
  const setStatus = useSetStatus(id ?? "");
  const replySection = useRef<HTMLElement>(null);
  const replyField = useRef<HTMLTextAreaElement>(null);

  if (thread.isError) {
    if (thread.error instanceof ApiError && thread.error.status === 404) {
      return (
        <EmptyState
          asPageTitle
          title="This thread doesn't exist"
          description="It may have been removed, or the link is wrong. The Community list has every question."
          action={
            <Button component={Link} to="/" variant="contained">
              Back to Community
            </Button>
          }
        />
      );
    }
    return (
      <ErrorState
        asPageTitle
        title="The thread could not load"
        message={thread.error.message}
        onRetry={() => void thread.refetch()}
      />
    );
  }

  if (thread.data === undefined) {
    return <ThreadSkeleton />;
  }

  const conversation = thread.data;
  const [question, ...replies] = conversation.posts;
  if (question === undefined) {
    return null;
  }
  // The accepted answer is lifted out of the replies and shown first; the rest keep the server's time order.
  const accepted = replies.find((post) => post.postId === conversation.acceptedPostId);
  const others = replies.filter((post) => post !== accepted);
  const heading = repliesHeading(others.length, accepted !== undefined);
  const canReply = can(role, "reply", { isLocked: conversation.locked });

  const goToReply = () => {
    replyField.current?.focus({ preventScroll: true });
    replySection.current?.scrollIntoView();
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: `minmax(0, 1fr) ${RAIL_WIDTH + RAIL_GAP / 2}px` },
        columnGap: `${RAIL_GAP / 2}px`,
        pb: { xs: canReply ? `${REPLY_BAR_HEIGHT}px` : 0, md: 0 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Breadcrumb category={conversation.category} title={conversation.title} />
        <ThreadHeader
          conversation={conversation}
          question={question}
          challenge={challenge}
          menu={
            can(role, "setStatus") ? (
              <StatusMenu
                status={conversation.status}
                pending={setStatus.isPending}
                onChange={(next) => setStatus.mutate(next)}
              />
            ) : undefined
          }
        />
        {/* What the status change is doing, for a screen reader: the chip changes far from the menu's button. */}
        <Box role="status" sx={visuallyHidden}>
          {setStatus.isPending && "Changing the status…"}
          {setStatus.isSuccess && `Status changed to ${STATUS_LABELS[conversation.status]}.`}
        </Box>
        {setStatus.isError && (
          <Box sx={{ ...besideGutter, mt: 2 }}>
            <InlineError message={`The status was not changed. ${setStatus.error.message}`} />
          </Box>
        )}

        <Box sx={{ mt: 3.5 }}>
          {accepted !== undefined && <AcceptedAnswer post={accepted} solvedByAsker={conversation.solvedByAsker} />}
          {accepted === undefined && conversation.status === "answered" && (
            <Typography color="text.secondary" sx={{ ...besideGutter, pt: 2.5, borderTop: 1, borderColor: "divider" }}>
              <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
                No accepted answer.
              </Box>{" "}
              Nobody has marked a reply as the one that solved this.
            </Typography>
          )}
        </Box>

        {heading !== undefined && (
          <Typography variant="h2" sx={{ mt: 4, mb: 1.5 }}>
            {heading}
          </Typography>
        )}
        {others.length > 0 && (
          <Box component="ol" sx={listReset}>
            {others.map((post) => (
              <ReplyItem key={post.postId} post={post} />
            ))}
          </Box>
        )}

        <Box
          component="section"
          id={REPLY_ID}
          ref={replySection}
          aria-label={canReply ? undefined : "Replies are closed"}
          sx={{
            mt: others.length > 0 ? 1.5 : 3,
            pt: 3.5,
            borderTop: 1,
            borderColor: "divider",
            // The Reply button brings this section to the top of the screen, below the sticky top bar.
            scrollMarginTop: TOP_BAR_HEIGHT + 16,
          }}
        >
          {canReply ? (
            <ReplyForm conversationId={conversation.id} fieldRef={replyField} />
          ) : (
            <>
              <Typography variant="h2">This thread is locked</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: "60ch" }}>
                It takes no new replies. If you have the same problem, search the questions for a thread that is still
                open.
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: "none", lg: "block" },
          pl: `${RAIL_GAP / 2}px`,
          borderLeft: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ position: "sticky", top: TOP_BAR_HEIGHT + 32 }}>
          <AboutChallenge challenge={challenge} variant="rail" />
        </Box>
      </Box>

      {/* On a phone the form is a long way down, so the way to it stays in reach. */}
      {canReply && (
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            zIndex: "appBar",
            left: 0,
            right: 0,
            bottom: 0,
            px: 2,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Button variant="contained" fullWidth onClick={goToReply}>
            Reply
          </Button>
        </Box>
      )}
    </Box>
  );
};
