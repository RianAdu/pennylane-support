import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { memo } from "react";
import { Link } from "react-router";
import type { ChallengeCard as ChallengeCardData } from "../../api/contract";
import { cardItemSx, cardSx, clampSx, countSx } from "./Challenges.styles";

/** From this many open questions a card stands out: 10 of the 102 published challenges reach it. */
const BUSY_FROM = 3;

const openQuestions = (count: number): string => {
  if (count === 0) {
    return "No open questions";
  }
  return count === 1 ? "1 open question" : `${count} open questions`;
};

type ChallengeCardProps = {
  challenge: ChallengeCardData;
  /** Shown beside a title that another challenge shares. */
  category: string;
};

/** One challenge on its category's shelf. The whole card opens the Community list filtered to that challenge. */
export const ChallengeCard = memo(({ challenge, category }: ChallengeCardProps) => {
  const { id, title, titleRepeats, difficulty, summary, openQuestionCount } = challenge;
  const busy = openQuestionCount >= BUSY_FROM;

  return (
    <Box component="li" sx={cardItemSx}>
      <Box component={Link} to={`/?${new URLSearchParams({ challengeId: id }).toString()}`} sx={cardSx(busy)}>
        <Typography className="title" component="h3" variant="subtitle1" sx={clampSx}>
          {titleRepeats ? `${title} (${category})` : title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {difficulty}
        </Typography>
        <Typography variant="body2" sx={{ ...clampSx, mt: 1 }}>
          {summary}
        </Typography>
        <Typography variant="body2" sx={countSx(busy, openQuestionCount === 0)}>
          {openQuestions(openQuestionCount)}
        </Typography>
      </Box>
    </Box>
  );
});
ChallengeCard.displayName = "ChallengeCard";
