import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { StrugglingChallenge } from "../../api/contract";
import { listReset } from "../../layouts/shared/sharedStyles";
import { sectionSx, summarySx } from "./Insights.styles";
import { percent, StruggleListItem, struggleName } from "./StruggleListItem";

const HEADING_ID = "where-learners-struggle";

const summaryOf = (struggling: StrugglingChallenge[]): string => {
  const top = struggling.at(0);
  if (top === undefined) {
    return "No challenge has an open question.";
  }
  const questions = top.openCount === 1 ? "1 open question" : `${top.openCount} open questions`;
  return `${struggleName(top)} leads with ${questions}, and ${percent.format(top.completionRate)} of attempts complete it.`;
};

/**
 * The challenges with the most open questions, beside how many attempts complete each. A list of links rather than
 * a chart: every figure is text, and every row leads to the questions it counts.
 */
export const StruggleList = ({ struggling }: { struggling: StrugglingChallenge[] }) => {
  const most = Math.max(1, ...struggling.map((challenge) => challenge.openCount));

  return (
    <Box component="section" aria-labelledby={HEADING_ID} sx={sectionSx}>
      <Typography id={HEADING_ID} variant="h2">
        Where learners struggle
      </Typography>
      <Typography color="text.secondary" sx={summarySx}>
        {summaryOf(struggling)}
      </Typography>
      <Box component="ol" aria-labelledby={HEADING_ID} sx={{ ...listReset, borderTop: 1, borderColor: "divider" }}>
        {struggling.map((challenge, index) => (
          <StruggleListItem key={challenge.challengeId} challenge={challenge} rank={index + 1} most={most} />
        ))}
      </Box>
    </Box>
  );
};
