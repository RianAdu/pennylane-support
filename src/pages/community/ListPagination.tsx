import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";

type ListPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  /** How many rows are on this page. */
  shown: number;
  /** The address of another page of the same view. */
  pageHref: (page: number) => string;
};

/** Where the viewer is in the list, and links to the other pages. Links, so a page can be opened in a new tab. */
export const ListPagination = ({ page, pageSize, total, shown, pageHref }: ListPaginationProps) => {
  const first = (page - 1) * pageSize + 1;
  const pageCount = Math.ceil(total / pageSize);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        pt: 2.5,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {first}–{first + shown - 1} of {total}
      </Typography>
      {pageCount > 1 && (
        <Pagination
          page={page}
          count={pageCount}
          siblingCount={1}
          boundaryCount={1}
          shape="rounded"
          aria-label="Pages"
          renderItem={(item) => <PaginationItem component={Link} to={pageHref(item.page ?? 1)} {...item} />}
          sx={{ mx: -0.5 }}
        />
      )}
    </Box>
  );
};
