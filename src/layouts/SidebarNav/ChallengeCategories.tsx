import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useChallenges } from "../../api/hooks/useChallenges";
import { slug } from "../../utils/slug";
import { listReset } from "../shared/sharedStyles";
import { NavRow } from "./NavRow";

const LOADING_ROWS = 6;

/**
 * The challenge categories, each a link to its row on the Challenges page. None is marked as current: they are
 * places on one page, and the viewer scrolls past them, so a mark would soon be wrong.
 */
export const ChallengeCategories = ({ onNavigate }: { onNavigate?: () => void }) => {
  const challenges = useChallenges();

  if (challenges.isPending) {
    return (
      <Box aria-hidden sx={{ pl: 3.5, pr: 1.5 }}>
        {Array.from({ length: LOADING_ROWS }, (_, index) => (
          <Skeleton key={index} height={40} />
        ))}
      </Box>
    );
  }

  if (challenges.isError) {
    return (
      <Box sx={{ pl: 3.5, pr: 1.5, py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Categories could not load.
        </Typography>
        <Button size="small" onClick={() => void challenges.refetch()} sx={{ ml: -0.5 }}>
          Try again
        </Button>
      </Box>
    );
  }

  return (
    <Box component="ul" sx={listReset}>
      {challenges.data.categories.map(({ name }) => (
        <li key={name}>
          <NavRow to={`/challenges#${slug(name)}`} current={false} onNavigate={onNavigate}>
            {name}
          </NavRow>
        </li>
      ))}
    </Box>
  );
};
