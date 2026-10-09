import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { CONVERSATION_TABS, type ConversationTab } from "../../../api/contract";
import { can } from "../../../domain/permissions";
import { useRole } from "../../../providers/role/useRole";

const DEFAULT_TAB: ConversationTab = "latest";

export type ListParams = {
  q: string | undefined;
  category: string | undefined;
  tab: ConversationTab;
  challengeId: string | undefined;
  page: number;
};

const textParam = (searchParams: URLSearchParams, name: string): string | undefined => {
  const value = searchParams.get(name)?.trim();
  return value === undefined || value === "" ? undefined : value;
};

const pageParam = (searchParams: URLSearchParams): number => {
  const page = Number(searchParams.get("page"));
  return Number.isInteger(page) && page >= 1 ? page : 1;
};

/**
 * The Community list's state, read from the URL and written back to it: search, category, tab, challenge and page,
 * and nothing else. Whatever changes what the list holds also goes back to the first page.
 */
export const useListParams = () => {
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = CONVERSATION_TABS.find((tab) => tab === searchParams.get("tab")) ?? DEFAULT_TAB;
  // Needs attention is the admin's. For anyone else the list is on Latest at once, so the forbidden request is never
  // sent, and the effect below takes the tab out of the address.
  const tabNotAllowed = requestedTab === "attention" && !can(role, "viewTriage");

  useEffect(() => {
    if (tabNotAllowed) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.delete("tab");
          next.delete("page");
          return next;
        },
        { replace: true },
      );
    }
  }, [tabNotAllowed, setSearchParams]);

  const params: ListParams = useMemo(() => {
    return {
      q: textParam(searchParams, "q"),
      category: textParam(searchParams, "category"),
      tab: tabNotAllowed ? DEFAULT_TAB : requestedTab,
      challengeId: textParam(searchParams, "challengeId"),
      page: tabNotAllowed ? 1 : pageParam(searchParams),
    };
  }, [searchParams, requestedTab, tabNotAllowed]);

  /** The same view on another page, as a link target. */
  const pageHref = useCallback(
    (page: number): string => {
      const next = new URLSearchParams(searchParams);
      if (page === 1) {
        next.delete("page");
      } else {
        next.set("page", String(page));
      }
      const search = next.toString();
      return search === "" ? "/" : `/?${search}`;
    },
    [searchParams],
  );

  const update = useCallback(
    (change: (next: URLSearchParams) => void) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        change(next);
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  const setTab = useCallback(
    (tab: ConversationTab) => {
      update((next) => {
        if (tab === DEFAULT_TAB) {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
      });
    },
    [update],
  );

  const clearChallenge = useCallback(() => {
    update((next) => next.delete("challengeId"));
  }, [update]);

  /** Clears the search and every filter. The tab stays: it is a view, not a filter. */
  const clearFilters = useCallback(() => {
    update((next) => {
      next.delete("q");
      next.delete("category");
      next.delete("challengeId");
    });
  }, [update]);

  return { params, pageHref, setTab, clearChallenge, clearFilters };
};
