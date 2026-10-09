import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import { visuallyHidden } from "../../layouts/shared/sharedStyles";
import { plural } from "../../utils/plural";
import { voteBlockIconSx, voteBlockSx } from "./ConversationRow.styles";

/** How many people have the question: a block on the row's left from 900 px, and a sentence for a screen reader. */
export const Votes = ({ count }: { count: number }) => {
  return (
    <>
      <Box className="votes" aria-hidden sx={voteBlockSx}>
        <KeyboardArrowUpIcon sx={voteBlockIconSx} />
        {count}
      </Box>
      <Box component="span" sx={visuallyHidden}>
        {plural(count, "person has", "people have")} this question.
      </Box>
    </>
  );
};
