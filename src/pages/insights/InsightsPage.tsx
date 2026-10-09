import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router";
import type { Insights } from "../../api/contract";
import { useInsights } from "../../api/hooks/useInsights";
import { can } from "../../domain/permissions";
import { ErrorState } from "../../error-handling/components/ErrorState";
import { PageHeader } from "../../layouts/PageHeader/PageHeader";
import { useRole } from "../../providers/role/useRole";
import { InsightsSkeleton } from "./InsightsSkeleton";
import { MonthlyChart } from "./MonthlyChart";
import { StruggleList } from "./StruggleList";
import { Tiles } from "./Tiles";

// The link is hidden from a learner, but the address still works: say why the page is empty and what to do.
const renderNotPermitted = () => {
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
};

const renderHeader = () => {
  return <PageHeader title="Insights" description="How support is keeping up, across every conversation" />;
};

const renderPending = () => {
  return (
    <>
      {renderHeader()}
      <InsightsSkeleton />
    </>
  );
};

const renderError = (insights: UseQueryResult<Insights>) => {
  return (
    <>
      {renderHeader()}
      <ErrorState
        title="The insights could not load"
        message={insights.error?.message ?? ""}
        onRetry={() => void insights.refetch()}
      />
    </>
  );
};

export const InsightsPage = () => {
  const { role } = useRole();
  const insights = useInsights();

  // Decided here, not by waiting for the server's 403: a learner's page sends no request at all.
  if (!can(role, "viewInsights")) return renderNotPermitted();
  if (insights.isPending) return renderPending();
  if (insights.isError) return renderError(insights);

  return (
    <>
      {renderHeader()}
      <Tiles insights={insights.data} />
      <StruggleList struggling={insights.data.struggling} />
      <MonthlyChart perMonth={insights.data.perMonth} busiestMonth={insights.data.busiestMonth} />
    </>
  );
};
