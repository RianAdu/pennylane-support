import { http, HttpResponse, type HttpHandler } from "msw";
import { can } from "../../domain/permissions";
import type { Store } from "../db/store";
import { getMeta } from "../queries/getMeta";
import { viewerRole } from "./viewerRole";

export const metaHandlers = (store: Store): HttpHandler[] => [
  http.get("/api/meta", ({ request }) => {
    return HttpResponse.json(getMeta(store, { includeAssignees: can(viewerRole(request), "viewTriage") }));
  }),
];
