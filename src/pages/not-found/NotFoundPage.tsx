import Button from "@mui/material/Button";
import { Link } from "react-router";
import { EmptyState } from "../../error-handling/components/EmptyState";

export const NotFoundPage = () => {
  return (
    <EmptyState
      asPageTitle
      title="Page not found"
      description="There is nothing at this address. The Community list has every question."
      action={
        <Button component={Link} to="/" variant="contained">
          Back to Community
        </Button>
      }
    />
  );
};
