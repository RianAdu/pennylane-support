import type { RouteObject } from "react-router";
import { AppLayout } from "../layouts/AppLayout";
import { ChallengesPage } from "../pages/challenges/ChallengesPage";
import { CommunityPage } from "../pages/community/CommunityPage";
import { InsightsPage } from "../pages/insights/InsightsPage";
import { NotFoundPage } from "../pages/not-found/NotFoundPage";
import { ThreadPage } from "../pages/thread/ThreadPage";

/** Route objects rather than a router, so the app mounts them in the browser's history and tests in memory. */
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <CommunityPage /> },
      { path: "/threads/:id", element: <ThreadPage /> },
      { path: "/challenges", element: <ChallengesPage /> },
      { path: "/insights", element: <InsightsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
