import { http, HttpResponse, type HttpHandler } from "msw";
import type { ApiErrorBody } from "../../api/contract";
import { can } from "../../domain/permissions";
import type { Store } from "../db/store";
import { getChallenge } from "../queries/getChallenge";
import { listChallenges } from "../queries/listChallenges";
import { viewerRole } from "./viewerRole";

export const challengeHandlers = (store: Store): HttpHandler[] => [
  http.get("/api/challenges", ({ request }) => {
    // Draft and archived challenges are an admin-only option: for anyone else it is ignored, not refused.
    const asked = new URL(request.url).searchParams.get("includeHidden") === "true";
    const includeHidden = asked && can(viewerRole(request), "viewHiddenChallenges");
    return HttpResponse.json(listChallenges(store, { includeHidden }));
  }),

  http.get("/api/challenges/:id", ({ params }) => {
    const challenge = getChallenge(store, String(params.id));
    if (!challenge) {
      return HttpResponse.json<ApiErrorBody>(
        { message: "This challenge does not exist. Check the link, or browse the challenges." },
        { status: 404 },
      );
    }
    return HttpResponse.json(challenge);
  }),
];
