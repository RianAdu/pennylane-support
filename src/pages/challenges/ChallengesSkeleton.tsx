import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { CARD_HEIGHT, CARD_WIDTH, scrollerSx } from "./Challenges.styles";

/** Challenges that have not arrived yet, in the page's own shape: two shelves of cards. */
export const ChallengesSkeleton = () => {
  return (
    <Box aria-hidden>
      {[0, 1].map((row) => (
        <Box key={row} sx={{ mt: row === 0 ? 1 : 5 }}>
          <Skeleton width={200} height={36} sx={{ mb: 1.5 }} />
          <Box sx={{ ...scrollerSx, overflowX: "hidden" }}>
            {[0, 1, 2].map((card) => (
              <Skeleton key={card} variant="rounded" height={CARD_HEIGHT} sx={{ flex: "none", width: CARD_WIDTH }} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
