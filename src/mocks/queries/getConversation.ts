import type { ConversationDetail } from "../../api/contract";
import { isSolvedByAsker } from "../../domain/normalize";
import type { Conversation } from "../../domain/types";
import type { Store } from "../db/store";

export const findConversation = (store: Store, id: string): Conversation | undefined => {
  return store.conversations.find((conversation) => conversation.id === id);
};

/**
 * One thread as the thread page reads it. `includeTriage` says whether it carries priority and assignee: the handler
 * decides that with `can()`.
 */
export const toConversationDetail = (
  conversation: Conversation,
  options: { includeTriage: boolean },
): ConversationDetail => {
  return {
    id: conversation.id,
    title: conversation.title,
    category: conversation.category,
    status: conversation.status,
    tags: conversation.tags,
    createdAt: conversation.createdAt,
    locked: conversation.locked,
    challengeId: conversation.challengeId,
    posts: conversation.posts,
    acceptedPostId: conversation.acceptedPostId,
    solvedByAsker: isSolvedByAsker(conversation),
    ...(options.includeTriage ? { priority: conversation.priority, assignee: conversation.assignee } : {}),
  };
};
