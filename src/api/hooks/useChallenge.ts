import { useQuery } from "@tanstack/react-query";
import { useRole } from "../../providers/role/useRole";
import type { ChallengeDetail } from "../contract";
import { apiGet } from "../http";
import { challengeKey } from "../queryKeys";

/** One challenge. Without an id there is nothing to ask for, and the query stays idle. */
export const useChallenge = (id: string | undefined) => {
  const { role } = useRole();
  return useQuery({
    queryKey: challengeKey(role, id),
    queryFn: () => apiGet<ChallengeDetail>(`/api/challenges/${encodeURIComponent(id ?? "")}`, role),
    enabled: id !== undefined,
  });
};
