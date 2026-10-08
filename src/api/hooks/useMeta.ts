import { useQuery } from "@tanstack/react-query";
import { useRole } from "../../providers/role/useRole";
import type { Meta } from "../contract";
import { apiGet } from "../http";
import { metaKey } from "../queryKeys";

/** Menu options: the categories with their thread counts, the tags and, for an admin, the assignees. */
export const useMeta = () => {
  const { role } = useRole();
  return useQuery({
    queryKey: metaKey(role),
    queryFn: () => apiGet<Meta>("/api/meta", role),
  });
};
