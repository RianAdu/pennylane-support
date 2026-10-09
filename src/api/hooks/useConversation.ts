import { useQuery } from "@tanstack/react-query";
import { useRole } from "../../providers/role/useRole";
import type { ConversationDetail } from "../contract";
import { apiGet } from "../http";
import { conversationKey } from "../queryKeys";

/** One thread with its posts. Without an id there is nothing to ask for, and the query stays idle. */
export const useConversation = (id: string | undefined) => {
  const { role } = useRole();
  return useQuery({
    queryKey: conversationKey(role, id),
    queryFn: () => apiGet<ConversationDetail>(`/api/conversations/${encodeURIComponent(id ?? "")}`, role),
    enabled: id !== undefined,
  });
};
