import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { CARD_HEIGHT, CARD_WIDTH, categoryHeaderSx, categorySx, scrollerSx, shelfFrameSx } from "./Challenges.styles";

/** The height of a category's heading row, which its arrow buttons set. */
const HEADER_HEIGHT = 36;

/** Challenges that have not arrived yet, in the page's own shape and spacing: two shelves of cards. */
export const ChallengesSkeleton = () => {
  return (
    <Box aria-hidden>
      {[0, 1].map((row) => (
        <Box key={row} sx={categorySx}>
          <Box sx={{ ...categoryHeaderSx, minHeight: HEADER_HEIGHT }}>
            <Skeleton width={200} height={28} />
          </Box>
          <Box sx={shelfFrameSx}>
            <Box sx={{ ...scrollerSx, overflowX: "hidden" }}>
              {[0, 1, 2].map((card) => (
                <Skeleton key={card} variant="rounded" height={CARD_HEIGHT} sx={{ flex: "none", width: CARD_WIDTH }} />
              ))}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
