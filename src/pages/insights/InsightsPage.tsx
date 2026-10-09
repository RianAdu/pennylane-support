import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";
import { can } from "../../domain/permissions";
import { useRole } from "../../providers/role/useRole";

export const InsightsPage = () => {
  const { role } = useRole();

  // The link is hidden from a learner, but the address still works: say why the page is empty and what to do.
  if (!can(role, "viewInsights")) {
    return (
      <>
        <Typography variant="h1">Insights are for admins</Typography>
        <Typography sx={{ mt: 1, maxWidth: "72ch" }}>
          You are viewing as a learner. Switch to Admin with “Viewing as” to see this page, or{" "}
          <MuiLink component={Link} to="/">
            go back to Community
          </MuiLink>
          .
        </Typography>
      </>
    );
  }

  return (
    <>
      <Typography variant="h1">Insights</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
        How support is keeping up
      </Typography>
    </>
  );
};
