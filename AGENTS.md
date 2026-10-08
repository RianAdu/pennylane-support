# AGENTS.md

Instructions for any AI coding agent working in this repository. This file is the single source of truth; `CLAUDE.md` only imports it. Requirements live in `docs/requirements.md`, with wireframes in `docs/wireframes/` linked from it; decisions live in `DECISIONS.md`. Requirement IDs (FR-1, NFR-3) refer to the requirements document. Before building a screen, open its wireframe. Wireframes fix layout, hierarchy and content, not pixels; where a wireframe and the text disagree, the text wins.

## Project

PennyLane Support: a learner-first support platform for PennyLane coding challenges, built as a frontend take-home. Learners browse challenges, find answers and ask for help; an admin moderates threads and sees insights.

- **Primary focus:** the support system (Community list and Thread page). Challenges and Insights are secondary.
- **Viewer roles:** `learner` and `admin`, switched in the UI. Mentor, staff and support exist only as labels on posts and render as badges. They are not viewer roles.
- **Data:** `data/pennylane_coding_challenges.json` (120) and `data/pennylane_support_conversations.json` (800, 3,061 posts). Raw files are never edited.
- **Proof of concept:** prefer a small, well-tested, well-explained core over breadth. Every decision must be explainable to a review panel.

## Stack

- Vite + React 19 + TypeScript (`strict: true`, no `any`)
- MUI (Material UI) with a custom theme; MUI X Charts (free version) for charts
- React Router v7 (library mode) for routes and URL search params
- TanStack Query v5 for all server state
- MSW v2 as the mock backend, in the browser and in tests
- `react-markdown` for Markdown, raw HTML disabled
- Vitest + Testing Library + jsdom for unit and component tests; Playwright + `@axe-core/playwright` for end-to-end and accessibility
- ESLint + Prettier
- Fonts via `@fontsource`: Atkinson Hyperlegible (all UI), JetBrains Mono (code blocks only)

Do not add a dependency that is not listed here without asking first, and record any approved addition in `DECISIONS.md`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the app with MSW enabled |
| `npm run build` | Type-check and build |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:e2e` | Playwright end-to-end and axe checks |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | lint + typecheck + test; must pass before every commit |

## Folder structure

```
data/                      raw JSON from the brief, read-only
src/
  app/                     providers, router, theme, layout (top bar, sidebar, drawer)
  domain/                  types, normalize.ts, permissions.ts (pure, no React)
  mocks/
    db/                    load + normalize the JSON once into an in-memory store
    queries/               pure functions: filter, sort, paginate, aggregate
    handlers/              MSW handlers, thin wrappers around queries/
    browser.ts / node.ts   setupWorker / setupServer
  api/                     fetch client + TanStack Query hooks per resource
  features/
    community/             list, sidebar categories, intent tabs
    thread/                Q/A thread, reply, manage menu, context rail
    challenges/            category rows of cards
    insights/              tiles and charts
    roles/                 RoleProvider, useRole, role switcher
  components/              shared UI (StatusChip, Avatar, EmptyState…)
  test/                    setup, render helpers, fixtures
e2e/                       Playwright specs
docs/                      requirements.md (what to build), wireframes/*.png
```

## Architecture rules

The request flow is: URL → component → TanStack Query hook → API client `fetch('/api/...')` → MSW handler → pure query function → in-memory store.

1. Components never import from `mocks/` or `data/`. They only use hooks from `api/`.
2. MSW handlers stay thin: parse the request, call a pure function in `mocks/queries/`, return a status and JSON. Logic lives in the pure functions, which are unit-tested on their own.
3. Swapping in a real backend must only remove `mocks/`. No app code may depend on the mock.
4. Permissions live in one function, `can(role, action, context)` in `domain/permissions.ts`. The UI calls it to hide controls; handlers call it to return 403. Never duplicate permission logic.
5. The viewer's role is sent on every request as the `X-Mock-Role` header.
6. List state (search, category, tab, filters, sort, page) lives in URL search params, never in component or global state.
7. The only global client state is the current role: React context plus a `useRole()` hook, remembered in `localStorage`.
8. Data changes use a pending state, then invalidate the affected queries. No optimistic updates.
9. Handlers add a 200–500 ms delay in the browser and 0 ms in tests.
10. Insights metrics are computed in the mock server (`/api/insights`), never in the browser.

## Mock API contract

All list responses: `{ items, page, pageSize, total }`. `pageSize` max 50, default 20.

| Method and path | Purpose | Rules |
| --- | --- | --- |
| `GET /api/conversations` | Paged list | `q`, `category`, `tab` (latest, unanswered, solved, attention), `challengeId`, `tag`, `priority`*, `assignee`*, `sort`, `page`, `pageSize` |
| `GET /api/conversations/:id` | Thread with posts | 404 if unknown |
| `POST /api/conversations` | Ask a question | 400 on missing fields |
| `POST /api/conversations/:id/posts` | Reply | 400 if empty; 409 if locked |
| `PATCH /api/conversations/:id` | status, assignee, priority, pinned, locked, acceptedPostId | 403 via `can()` |
| `GET /api/challenges` | Paged, filtered | `q`, `difficulty`, `category`, `includeHidden` |
| `GET /api/challenges/:id` | One challenge with open-question count | 404 if unknown |
| `GET /api/insights` | Aggregated metrics | 403 unless admin |
| `GET /api/meta` | Categories, tags, assignees for menus | |

\* Ignored unless the role is admin. The `attention` tab is admin only: open threads that are unassigned or high or urgent priority.

## Data normalization rules

Normalization runs once when the store loads. Every rule has a unit test in `domain/normalize.test.ts`.

- Sort posts by timestamp (449 of 800 conversations are out of order).
- Recompute `lastActivityAt` from the latest post after sorting (267 conversations are wrong in the source).
- Keep `user_role` per post as "role at time of posting"; never derive a user's role (20 users have several roles).
- Missing `description` (60): fall back to the first post's content.
- `points` may be a string (CHAL_022): convert to a number.
- Key everything on IDs. Topic titles repeat (723 of 800 share one) and challenge titles repeat.
- Keep `status` as given. "Answered" without an accepted answer (105) stays "answered".
- An accepted answer can be the opening post (48 conversations): label it "Solved by the asker".
- `assigned_to: null` means unassigned (164).
- Resolution metrics use resolved and closed conversations only (`resolution_time_hours` is null otherwise).
- Draft and archived challenges (18) are hidden from the challenge list by default; their conversations stay visible.

## UI and UX rules

- **Layout:** top bar (brand, search, role switcher); labelled left sidebar (Community with its 13 categories, Challenges with its categories, Insights for admin). The active section expands.
- **Community list:** intent tabs Latest, Unanswered, Solved (plus Needs attention for admin). Row: vote count (display only), initials avatar, title, two-line excerpt, status chip, challenge name, reply count, last activity. "More filters" holds the rest.
- **Thread page:** Q: marker and title; "N people have this question too" from the opening post's upvotes; accepted answer directly under the question, marked A:; other replies in time order; right rail with "About this challenge" and "Related threads". Admin actions sit behind a ⋯ menu. The sidebar collapses on this page; the breadcrumb keeps the place.
- **Challenges:** a row of cards per category, scrolled with arrow buttons; each card shows open-question count.
- **Insights:** four tiles, then four charts, each with a one-line text summary.
- **Responsive:** MUI breakpoints. Below 900 px the sidebar becomes a temporary Drawer opened from a menu button; every screen is one column; the thread's Reply button stays pinned to the bottom.
- **Theme:** light. Ink #1E2533, paper #FBFBFD, action #2D4FA8, solved #157A55, waiting #9A5B00, rules #DDE1E7. Lists are rows separated by rules, not stacks of cards.
- **Copy:** sentence case, plain words from the learner's side ("Ask a question", "Try again"). No internal IDs on screen. Errors say what happened and what to do.
- **Votes and helpful counts are display only.**

## Accessibility rules (target WCAG 2.2 AA)

- Semantic HTML first; ARIA only where HTML falls short. Landmarks and a logical heading order on every page.
- Everything works with a keyboard, with a visible focus ring.
- Status always pairs color with a word. Contrast at least 4.5:1 for text.
- Announce result counts and errors through a live region.
- Tabs use MUI Tabs (proper tablist). The mobile Drawer traps focus, closes on Esc and returns focus to its trigger.
- Decorative icons and avatars are hidden from screen readers.
- Respect `prefers-reduced-motion`.

## Testing rules

- Unit tests: `domain/` (normalize, permissions) and `mocks/queries/` (filter, sort, paginate, insights).
- Component tests: render through the real MSW handlers (via `setupServer`), not mocked hooks. Cover list filtering and tabs, replying, role gating and a 403 shown to the user.
- One Playwright run: filter the list, open a thread, reply. Run an axe check on each main page.
- Name tests after behaviour and reference the requirement: `it('hides priority from learners (FR-1)')`.
- Never weaken or delete a test to make it pass. A failing test means fix the code or ask.

## Working agreement for agents

1. **Plan first.** Before each slice, outline the files you will touch and the tests you will add, then wait for approval.
2. **One slice per commit.** Keep diffs small and focused on one requirement or milestone step.
3. **Commit messages:** Conventional Commits with the reason in the body, for example `feat(community): add intent tabs (FR-4)` followed by why.
4. **Definition of done:** `npm run check` passes, new behaviour has a test, no TypeScript errors, no lint warnings.
5. **Decisions:** when you choose between real alternatives, add a row to `DECISIONS.md` (decision, rejected, why).
6. **Ask, don't assume,** when a requirement is unclear or two rules conflict.
7. **Don't touch** `data/` raw files, and don't change the API contract or folder structure without asking.
8. **Stay in scope.** Out of scope: authentication, real voting, a moderator role, dark theme, optimistic updates. Cut list, in order: ask-flow hints, challenge page, related threads, pin and lock, sessionStorage persistence, charts 4 → 2, the ask form itself.
