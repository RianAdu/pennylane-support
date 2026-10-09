import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRole } from "../../providers/role/useRole";
import type { ConversationDetail, ReplyBody } from "../contract";
import { apiSend } from "../http";
import { STALE_AFTER_THREAD_CHANGE } from "../queryKeys";

/**
 * Posts a reply to a thread. Nothing is shown before the server has answered: the mutation stays pending until the
 * thread has been fetched again, so the form lets go at the moment the reply is on screen.
 */
export const useReply = (conversationId: string) => {
  const { role } = useRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => {
      const body: ReplyBody = { content };
      return apiSend<ConversationDetail>(
        "POST",
        `/api/conversations/${encodeURIComponent(conversationId)}/posts`,
        role,
        body,
      );
    },
    onSuccess: () => {
      return Promise.all(STALE_AFTER_THREAD_CHANGE.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
    },
  });
};
