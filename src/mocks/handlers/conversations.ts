import { http, HttpResponse, type HttpHandler } from "msw";
import type { ApiErrorBody } from "../../api/contract";
import { can } from "../../domain/permissions";
import type { Conversation } from "../../domain/types";
import type { Store } from "../db/store";
import { addReply } from "../queries/addReply";
import { findConversation, toConversationDetail } from "../queries/getConversation";
import { listConversations } from "../queries/listConversations";
import { parseListParams } from "../queries/parseListParams";
import { setStatus } from "../queries/setStatus";
import { viewerRole } from "./viewerRole";

const refuse = (status: number, message: string) => HttpResponse.json<ApiErrorBody>({ message }, { status });

const notFound = () => refuse(404, "This thread doesn't exist. It may have been removed, or the link is wrong.");

/** A body that is not JSON is read as no body at all, and refused as such by the rule that needs it. */
const jsonBody = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
};

const replyContent = (body: unknown): string => {
  return typeof body === "object" && body !== null && "content" in body && typeof body.content === "string"
    ? body.content
    : "";
};

const detail = (conversation: Conversation, request: Request, status = 200) => {
  const includeTriage = can(viewerRole(request), "viewTriage");
  return HttpResponse.json(toConversationDetail(conversation, { includeTriage }), { status });
};

export const conversationHandlers = (store: Store): HttpHandler[] => [
  http.get("/api/conversations", ({ request }) => {
    const canViewTriage = can(viewerRole(request), "viewTriage");
    const parsed = parseListParams(new URL(request.url).searchParams);

    if (parsed.tab === "attention" && !canViewTriage) {
      return HttpResponse.json<ApiErrorBody>(
        { message: "Only an admin can see the threads that need attention. Switch to Admin, or open Latest." },
        { status: 403 },
      );
    }

    // Priority and assignee are admin-only filters: for anyone else they are ignored, not refused.
    const params = canViewTriage ? parsed : { ...parsed, priority: undefined, assignee: undefined };
    return HttpResponse.json(listConversations(store, params, { includeTriage: canViewTriage }));
  }),

  http.get("/api/conversations/:id", ({ request, params }) => {
    const conversation = findConversation(store, String(params.id));
    return conversation ? detail(conversation, request) : notFound();
  }),

  http.post("/api/conversations/:id/posts", async ({ request, params }) => {
    const role = viewerRole(request);
    const conversation = findConversation(store, String(params.id));
    if (!conversation) {
      return notFound();
    }
    if (!can(role, "reply", { isLocked: conversation.locked })) {
      return refuse(409, "This thread is locked, so it takes no new replies. Your reply was not posted.");
    }
    const content = replyContent(await jsonBody(request));
    if (!addReply(conversation, { content, role, now: new Date().toISOString() })) {
      return refuse(400, "A reply needs some text. Write your reply, then post it.");
    }
    return detail(conversation, request, 201);
  }),

  http.patch("/api/conversations/:id", async ({ request, params }) => {
    const conversation = findConversation(store, String(params.id));
    if (!conversation) {
      return notFound();
    }
    if (!can(viewerRole(request), "setStatus")) {
      return refuse(403, "Only an admin can change a thread's status. Switch to Admin to change it.");
    }
    if (!setStatus(conversation, await jsonBody(request))) {
      return refuse(
        400,
        "A thread's status is the only thing that can be changed here: open, answered, resolved or closed.",
      );
    }
    return detail(conversation, request);
  }),
];
