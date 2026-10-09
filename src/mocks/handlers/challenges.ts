import { http, HttpResponse, type HttpHandler } from "msw";
import type { ApiErrorBody } from "../../api/contract";
import type { Store } from "../db/store";
import { getChallenge } from "../queries/getChallenge";

export const challengeHandlers = (store: Store): HttpHandler[] => [
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
