import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import { Link } from "react-router";
import { listReset } from "../../../layouts/shared/sharedStyles";

type BreadcrumbProps = {
  category: string;
  title: string;
};

/** Where the thread sits. The sidebar is not on this page, so this is the way back to the thread's category. */
export const Breadcrumb = ({ category, title }: BreadcrumbProps) => {
  const separator = (
    <Box component="span" aria-hidden sx={{ mx: 1, color: "text.secondary" }}>
      /
    </Box>
  );
  return (
    <Box component="nav" aria-label="Breadcrumb" sx={{ mb: { xs: 2, md: 3 } }}>
      <Box component="ol" sx={{ ...listReset, display: "flex", alignItems: "center", typography: "body2" }}>
        <Box component="li" sx={{ flexShrink: 0 }}>
          <MuiLink component={Link} to="/">
            Community
          </MuiLink>
          {separator}
        </Box>
        <Box component="li" sx={{ flexShrink: 0 }}>
          <MuiLink component={Link} to={`/?${new URLSearchParams({ category }).toString()}`}>
            {category}
          </MuiLink>
        </Box>
        {/* The title is right below on a phone, so the third step only shows where there is room for it. */}
        <Box
          component="li"
          aria-current="page"
          sx={{
            display: { xs: "none", md: "block" },
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "text.secondary",
          }}
        >
          {separator}
          {title}
        </Box>
      </Box>
    </Box>
  );
};
