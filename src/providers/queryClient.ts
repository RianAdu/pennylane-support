import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/http";

const MAX_RETRIES = 2;

/** A 4xx is the server's answer, not a failure: asking again returns the same thing. */
const isClientError = (error: unknown): boolean => {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
};

export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => !isClientError(error) && failureCount < MAX_RETRIES,
      },
    },
  });
};
