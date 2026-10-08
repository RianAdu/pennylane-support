import { http, HttpResponse, type HttpHandler } from "msw";
import type { ApiErrorBody } from "../../api/contract";
import { can } from "../../domain/permissions";
import type { Store } from "../db/store";
import { listConversations } from "../queries/listConversations";
import { parseListParams } from "../queries/parseListParams";
import { viewerRole } from "./viewerRole";

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
];
