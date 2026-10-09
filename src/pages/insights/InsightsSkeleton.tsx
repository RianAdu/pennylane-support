import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { sectionSx, summarySx } from "./Insights.styles";

/** The strip of figures: one row of four from 600 px, two rows of two below that. */
const TILES_HEIGHT = { xs: 257, sm: 120 };

/** Insights that have not arrived yet, in the page's own shape and spacing: the strip of figures, then the ranking. */
export const InsightsSkeleton = () => {
  return (
    <Box aria-hidden>
      <Skeleton variant="rounded" sx={{ height: TILES_HEIGHT }} />
      <Box sx={sectionSx}>
        <Skeleton width={240} height={28} />
        <Skeleton width="70%" height={24} sx={summarySx} />
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} height={53} />
        ))}
      </Box>
    </Box>
  );
};
