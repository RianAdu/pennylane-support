import type { ViewerRole } from "../domain/types";
import { ROLE_HEADER } from "./contract";

type QueryValue = string | number | undefined;

const FALLBACK_MESSAGE = "Something went wrong. Try again.";

/** A non-2xx response. It keeps the status, so the UI can tell "not permitted" from "not found" from a failure. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const toSearch = (query: Record<string, QueryValue>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const text = search.toString();
  return text === "" ? "" : `?${text}`;
};

const errorMessage = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
      return body.message;
    }
  } catch {
    // Not JSON: the fallback below is all there is to say.
  }
  return FALLBACK_MESSAGE;
};

/** The one place the app calls `fetch` for a read. Every request carries the viewer's role. */
export const apiGet = async <T>(path: string, role: ViewerRole, query: Record<string, QueryValue> = {}): Promise<T> => {
  const response = await fetch(`${path}${toSearch(query)}`, { headers: { [ROLE_HEADER]: role } });
  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response));
  }
  return (await response.json()) as T;
};
