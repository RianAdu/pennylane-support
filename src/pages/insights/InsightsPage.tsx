import Button from "@mui/material/Button";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router";
import type { Insights } from "../../api/contract";
import { useInsights } from "../../api/hooks/useInsights";
import { can } from "../../domain/permissions";
import { EmptyState } from "../../error-handling/components/EmptyState";
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
    <EmptyState
      asPageTitle
      title="Insights are for admins"
      description="You are viewing as a learner. Switch to Admin with “Viewing as” to see this page."
      action={
        <Button component={Link} to="/" variant="contained">
          Back to Community
        </Button>
      }
    />
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
