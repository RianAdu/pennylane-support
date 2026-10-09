import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";

export const NotFoundPage = () => {
  return (
    <>
      <Typography variant="h1">Page not found</Typography>
      <Typography sx={{ mt: 1 }}>
        There is nothing at this address.{" "}
        <MuiLink component={Link} to="/">
          Go to Community
        </MuiLink>
      </Typography>
    </>
  );
};
