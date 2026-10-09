import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useMeta } from "../../api/hooks/useMeta";
import { listReset, visuallyHidden } from "../shared/sharedStyles";
import { NavRow } from "./NavRow";

const LOADING_ROWS = 6;

type CategoriesProps = {
  /** The category the list is filtered by, if any. */
  activeCategory: string | null;
  onNavigate?: () => void;
};

/** The community categories with their thread counts, each a link to the list filtered by it. */
export const Categories = ({ activeCategory, onNavigate }: CategoriesProps) => {
  const meta = useMeta();

  if (meta.isPending) {
    return (
      <Box aria-hidden sx={{ pl: 3.5, pr: 1.5 }}>
        {Array.from({ length: LOADING_ROWS }, (_, index) => (
          <Skeleton key={index} height={40} />
        ))}
      </Box>
    );
  }

  if (meta.isError) {
    return (
      <Box sx={{ pl: 3.5, pr: 1.5, py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Categories could not load.
        </Typography>
        <Button size="small" onClick={() => void meta.refetch()} sx={{ ml: -0.5 }}>
          Try again
        </Button>
      </Box>
    );
  }

  return (
    <Box component="ul" sx={listReset}>
      {meta.data.categories.map(({ name, count }) => (
        <li key={name}>
          <NavRow
            to={`/?${new URLSearchParams({ category: name }).toString()}`}
            current={name === activeCategory}
            onNavigate={onNavigate}
          >
            {name}
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              aria-hidden
              sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 400 }}
            >
              {count}
            </Typography>
            <Box component="span" sx={visuallyHidden}>
              , {count} threads
            </Box>
          </NavRow>
        </li>
      ))}
    </Box>
  );
};
