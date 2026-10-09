import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { besideGutter, gutterRow } from "./Thread.styles";

/** A thread that has not arrived yet, in the page's own shape: the question, the answer block, two replies. */
export const ThreadSkeleton = () => {
  return (
    <Box aria-hidden>
      <Skeleton width={180} height={22} sx={{ mb: { xs: 2, md: 3 } }} />
      <Box sx={gutterRow}>
        <Skeleton width={36} height={36} sx={{ display: { xs: "none", md: "block" } }} />
        <Box>
          <Skeleton width="85%" height={36} />
          <Skeleton width="40%" height={36} sx={{ display: { md: "none" } }} />
        </Box>
      </Box>
      <Box sx={besideGutter}>
        <Skeleton width={220} height={28} sx={{ mt: 1.5 }} />
        <Skeleton width={260} height={24} sx={{ mt: 1.5 }} />
        <Skeleton height={24} sx={{ mt: 2.5 }} />
        <Skeleton width="70%" height={24} />
      </Box>
      <Skeleton variant="rounded" height={148} sx={{ mt: 3.5 }} />
      {[0, 1].map((row) => (
        <Box key={row} sx={{ ...gutterRow, py: 2.5, mt: row === 0 ? 3 : 0, borderTop: 1, borderColor: "divider" }}>
          <Skeleton variant="circular" width={36} height={36} sx={{ display: { xs: "none", md: "block" } }} />
          <Box>
            <Skeleton width={200} height={24} />
            <Skeleton height={24} sx={{ mt: 1 }} />
            <Skeleton width="55%" height={24} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};
