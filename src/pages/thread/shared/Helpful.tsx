import Typography from "@mui/material/Typography";
import { plural } from "../../../utils/plural";

/** How many readers a post helped. Display only, and left out when nobody has said so. */
export const Helpful = ({ count }: { count: number }) => {
  if (count === 0) {
    return null;
  }
  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
      {plural(count, "person", "people")} found this helpful
    </Typography>
  );
};
