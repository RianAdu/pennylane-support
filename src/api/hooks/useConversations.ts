import { useQuery } from "@tanstack/react-query";
import { useRole } from "../../providers/role/useRole";
import type { ConversationListQuery, ConversationSummary, Paged } from "../contract";
import { apiGet } from "../http";
import { conversationsKey } from "../queryKeys";

/** One page of the Community list for the current viewer. */
export const useConversations = (query: ConversationListQuery = {}) => {
  const { role } = useRole();
  return useQuery({
    queryKey: conversationsKey(role, query),
    queryFn: () => apiGet<Paged<ConversationSummary>>("/api/conversations", role, query),
    // Keep the previous page on screen while the next one loads, but only when it was fetched for the same role:
    // after a role switch the previous page belongs to the other role.
    placeholderData: (previousData, previousQuery) => {
      return previousQuery?.queryKey[1] === role ? previousData : undefined;
    },
  });
};
