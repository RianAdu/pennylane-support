import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";
import type { StrugglingChallenge } from "../../api/contract";
import type { ChallengeStatus } from "../../domain/types";
import { visuallyHidden } from "../../layouts/shared/sharedStyles";
import { barTrackSx, figureSx, struggleLinkSx, struggleRowSx } from "./Insights.styles";

export const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

// A challenge that is off the Challenges page still has threads waiting. Said in words, as on the thread page.
const HIDDEN_LABELS: Record<ChallengeStatus, string | undefined> = {
  published: undefined,
  archived: "Archived challenge",
  draft: "Draft challenge",
};

/** A repeated title is told apart by its category. */
export const struggleName = ({ title, titleRepeats, category }: StrugglingChallenge): string => {
  return titleRepeats ? `${title} (${category})` : title;
};

/** The open questions about one challenge: the Community list, filtered to it, on the Unanswered tab. */
const openQuestionsHref = (challengeId: string): string => {
  return `/?${new URLSearchParams({ challengeId, tab: "unanswered" }).toString()}`;
};

type StruggleListItemProps = {
  challenge: StrugglingChallenge;
  /** The challenge's place in the ranking, from 1. */
  rank: number;
  /** The largest open count in the ranking: the length of a full bar. */
  most: number;
};

/** One row of the ranking. The whole row is one link, named by the challenge and its two figures. */
export const StruggleListItem = ({ challenge, rank, most }: StruggleListItemProps) => {
  const hiddenLabel = HIDDEN_LABELS[challenge.status];
  const completed = `${percent.format(challenge.completionRate)} completed`;

  return (
    <Box component="li" sx={struggleRowSx}>
      {/* The list is ordered, so a screen reader already gives the place. */}
      <Typography
        aria-hidden
        variant="body2"
        color="text.secondary"
        sx={{ gridArea: "rank", fontVariantNumeric: "tabular-nums" }}
      >
        {rank}
      </Typography>
      <Box component={Link} to={openQuestionsHref(challenge.challengeId)} sx={struggleLinkSx}>
        <Typography className="name" component="span" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
          {struggleName(challenge)}
        </Typography>
        {hiddenLabel !== undefined && (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {hiddenLabel}
          </Typography>
        )}
        <Box component="span" sx={visuallyHidden}>
          , {challenge.openCount} open, {completed}
        </Box>
      </Box>
      <Box aria-hidden sx={barTrackSx}>
        <Box sx={{ width: `${(challenge.openCount / most) * 100}%`, height: 1, bgcolor: "waiting.main" }} />
      </Box>
      <Typography aria-hidden variant="body2" sx={{ ...figureSx, gridArea: "open", fontWeight: 700 }}>
        {challenge.openCount} open
      </Typography>
      <Typography aria-hidden variant="body2" color="text.secondary" sx={{ ...figureSx, gridArea: "completed" }}>
        {completed}
      </Typography>
    </Box>
  );
};
