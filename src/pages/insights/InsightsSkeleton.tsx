import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

/** Insights that have not arrived yet, in the page's own shape: the strip of figures, then the ranking. */
export const InsightsSkeleton = () => {
  return (
    <Box aria-hidden>
      <Skeleton variant="rounded" height={112} />
      <Skeleton width={240} height={32} sx={{ mt: { xs: 5, md: 6 } }} />
      <Skeleton width="70%" height={24} sx={{ mb: 2 }} />
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} height={52} />
      ))}
    </Box>
  );
};
