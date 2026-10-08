import { ROLE_HEADER } from "../../api/contract";
import { VIEWER_ROLES, type ViewerRole } from "../../domain/types";

/** Who is asking. A missing or unknown role is a learner, so a malformed request never gets more than a learner. */
export const viewerRole = (request: Request): ViewerRole => {
  const header = request.headers.get(ROLE_HEADER);
  return VIEWER_ROLES.find((role) => role === header) ?? "learner";
};
