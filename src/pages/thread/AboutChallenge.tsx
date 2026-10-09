import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router";
import type { ChallengeDetail } from "../../api/contract";
import type { ChallengeStatus } from "../../domain/types";
import { visuallyHidden } from "../../layouts/shared/sharedStyles";

// A challenge that is not on the Challenges page any more, or not yet, still has its threads. Said in words.
const HIDDEN_LABELS: Record<ChallengeStatus, string | undefined> = {
  published: undefined,
  archived: "Archived challenge",
  draft: "Draft challenge",
};

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });
const count = new Intl.NumberFormat("en-US");

/** The Community list, filtered to the questions about one challenge. There is no page per challenge. */
export const challengeQuestionsHref = (challengeId: string): string => {
  return `/?${new URLSearchParams({ challengeId }).toString()}`;
};

/** A repeated title is told apart by its category. */
export const challengeName = (challenge: ChallengeDetail): string => {
  return challenge.titleRepeats ? `${challenge.title} (${challenge.category})` : challenge.title;
};

/** The rail beside the thread from 1200 px, or the strip under the header below that. */
type Variant = "rail" | "strip";

type AboutChallengeProps = {
  challenge: UseQueryResult<ChallengeDetail>;
  variant: Variant;
};

const headingId = (variant: Variant): string => `about-challenge-${variant}`;

/** The section's name. The rail shows it; the strip is too small for a title and keeps it for screen readers. */
const Heading = ({ variant }: { variant: Variant }) => {
  return (
    <Typography
      id={headingId(variant)}
      component="h2"
      variant="body2"
      color="text.secondary"
      sx={variant === "strip" ? visuallyHidden : { mb: 1.5, fontWeight: 700 }}
    >
      About this challenge
    </Typography>
  );
};

const Fact = ({ label, value }: { label: string; value: string }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1, borderTop: 1, borderColor: "divider" }}>
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 700, textAlign: "right" }}>
        {value}
      </Typography>
    </Box>
  );
};

const renderPending = (variant: Variant) => {
  return (
    <Box aria-hidden>
      <Skeleton width="70%" height={24} />
      <Skeleton width="90%" height={20} />
      {variant === "rail" && <Skeleton width="90%" height={20} />}
    </Box>
  );
};

const renderError = (variant: Variant, onRetry: () => void) => {
  return (
    <Box component={variant === "rail" ? "aside" : "section"} aria-labelledby={headingId(variant)}>
      <Heading variant={variant} />
      <Typography variant="body2" color="text.secondary">
        The challenge could not load.
      </Typography>
      <Button size="small" onClick={onRetry} sx={{ ml: -0.5 }}>
        Try again
      </Button>
    </Box>
  );
};

const renderStrip = (challenge: ChallengeDetail) => {
  const hiddenLabel = HIDDEN_LABELS[challenge.status];
  return (
    <Box
      component="section"
      aria-labelledby={headingId("strip")}
      sx={{ px: 1.5, py: 1.25, borderRadius: 1, bgcolor: "surface" }}
    >
      <Heading variant="strip" />
      <MuiLink
        component={Link}
        to={challengeQuestionsHref(challenge.id)}
        color="text.primary"
        sx={{ display: "block", fontWeight: 700, overflowWrap: "anywhere" }}
      >
        {challengeName(challenge)}
      </MuiLink>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
        {challenge.difficulty}, {percent.format(challenge.completionRate)} completion,{" "}
        {count.format(challenge.attemptCount)} attempts
        {hiddenLabel !== undefined && (
          <>
            .{" "}
            <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
              {hiddenLabel}
            </Box>
          </>
        )}
      </Typography>
    </Box>
  );
};

/** What the thread's challenge is and how hard learners find it: the context a question is asked in. */
export const AboutChallenge = ({ challenge, variant }: AboutChallengeProps) => {
  if (challenge.isPending) {
    return renderPending(variant);
  }
  if (challenge.isError) {
    return renderError(variant, () => void challenge.refetch());
  }
  if (variant === "strip") {
    return renderStrip(challenge.data);
  }

  const { id, title, titleRepeats, category, difficulty, completionRate, attemptCount, status } = challenge.data;
  const hiddenLabel = HIDDEN_LABELS[status];

  return (
    <Box component="aside" aria-labelledby={headingId("rail")}>
      <Heading variant="rail" />
      <Typography variant="subtitle1" component="p" sx={{ overflowWrap: "anywhere" }}>
        {title}
      </Typography>
      {titleRepeats && (
        <Typography variant="body2" color="text.secondary">
          {category}
        </Typography>
      )}
      {hiddenLabel !== undefined && (
        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
          {hiddenLabel}
        </Typography>
      )}
      <Box component="dl" sx={{ mt: 2, mb: 0, borderBottom: 1, borderColor: "divider" }}>
        <Fact label="Difficulty" value={difficulty} />
        <Fact label="Completion rate" value={percent.format(completionRate)} />
        <Fact label="Attempts" value={count.format(attemptCount)} />
      </Box>
      <MuiLink component={Link} to={challengeQuestionsHref(id)} variant="body2" sx={{ display: "inline-block", mt: 2 }}>
        Questions about this challenge
      </MuiLink>
    </Box>
  );
};
