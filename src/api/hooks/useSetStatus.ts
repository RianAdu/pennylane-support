import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConversationStatus } from "../../domain/types";
import { useRole } from "../../providers/role/useRole";
import type { ConversationDetail, ConversationPatch } from "../contract";
import { apiSend } from "../http";
import { STALE_AFTER_THREAD_CHANGE } from "../queryKeys";

/** Changes a thread's status. The server may refuse, so the page shows the new status only once it is fetched. */
export const useSetStatus = (conversationId: string) => {
  const { role } = useRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: ConversationStatus) => {
      const body: ConversationPatch = { status };
      return apiSend<ConversationDetail>(
        "PATCH",
        `/api/conversations/${encodeURIComponent(conversationId)}`,
        role,
        body,
      );
    },
    onSuccess: () => {
      return Promise.all(STALE_AFTER_THREAD_CHANGE.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });
};
