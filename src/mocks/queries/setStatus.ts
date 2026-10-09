import { CONVERSATION_STATUSES, type Conversation } from "../../domain/types";

/**
 * Sets a thread's status from a PATCH body. Status is the only field the server takes: a body with anything else in
 * it, or with a status that does not exist, changes nothing and returns false.
 */
export const setStatus = (conversation: Conversation, body: unknown): boolean => {
  if (typeof body !== "object" || body === null) {
    return false;
  }
  const fields = Object.entries(body);
  const status = CONVERSATION_STATUSES.find(
    (known) => fields.length === 1 && "status" in body && known === body.status,
  );
  if (status === undefined) {
    return false;
  }
  conversation.status = status;
  return true;
};
