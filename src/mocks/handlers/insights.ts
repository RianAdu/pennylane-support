import { http, HttpResponse, type HttpHandler } from "msw";
import type { ApiErrorBody } from "../../api/contract";
import { can } from "../../domain/permissions";
import type { Store } from "../db/store";
import { computeInsights } from "../queries/computeInsights";
import { viewerRole } from "./viewerRole";

export const insightsHandlers = (store: Store): HttpHandler[] => [
  http.get("/api/insights", ({ request }) => {
    if (!can(viewerRole(request), "viewInsights")) {
      return HttpResponse.json<ApiErrorBody>(
        { message: "Only an admin can see insights. Switch to Admin to see them." },
        { status: 403 },
      );
    }
    return HttpResponse.json(computeInsights(store));
  }),
];
