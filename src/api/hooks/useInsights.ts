import { useQuery } from "@tanstack/react-query";
import { can } from "../../domain/permissions";
import { useRole } from "../../providers/role/useRole";
import type { Insights } from "../contract";
import { apiGet } from "../http";
import { insightsKey } from "../queryKeys";

/** The admin's metrics. A learner would only be refused, so for a learner the query stays idle. */
export const useInsights = () => {
  const { role } = useRole();
  return useQuery({
    queryKey: insightsKey(role),
    queryFn: () => apiGet<Insights>("/api/insights", role),
    enabled: can(role, "viewInsights"),
  });
};
