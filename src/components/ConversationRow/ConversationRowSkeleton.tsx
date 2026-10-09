import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { fromMdSx, rowSx, skeletonExcerptSx, skeletonPhoneLineSx, skeletonStatusSx } from "./ConversationRow.styles";

/** A row that has not arrived yet, in the row's own shape. */
export const ConversationRowSkeleton = () => {
  return (
    <Box component="li" sx={rowSx}>
      <Skeleton variant="rounded" height={48} sx={fromMdSx} />
      <Skeleton variant="circular" width={36} height={36} sx={fromMdSx} />
      <Box>
        <Skeleton width="62%" height={24} />
        <Skeleton height={22} sx={skeletonExcerptSx} />
        <Skeleton width="80%" height={22} sx={fromMdSx} />
        <Skeleton width="45%" height={24} sx={skeletonStatusSx} />
        <Skeleton width="55%" height={18} sx={skeletonPhoneLineSx} />
      </Box>
    </Box>
  );
};
