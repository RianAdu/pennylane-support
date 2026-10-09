import { useQuery } from "@tanstack/react-query";
import { useRole } from "../../providers/role/useRole";
import type { ChallengeGroups } from "../contract";
import { apiGet } from "../http";
import { challengesKey } from "../queryKeys";

/** The published challenges, grouped by category. The Challenges page and the navigation read the same answer. */
export const useChallenges = () => {
  const { role } = useRole();
  return useQuery({
    queryKey: challengesKey(role),
    queryFn: () => apiGet<ChallengeGroups>("/api/challenges", role),
  });
};
