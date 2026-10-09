# AGENTS.md

Instructions for any AI coding agent working in this repository. This file is the single source of truth; `CLAUDE.md` only imports it. Requirements live in `docs/requirements.md`, with wireframes in `docs/wireframes/` linked from it; decisions live in `DECISIONS.md`. Requirement IDs (FR-1, NFR-3) refer to the requirements document. Before building a screen, open its wireframe. Wireframes fix structure and content, not visual design; where a wireframe and the text disagree, the text wins. The wireframes were drawn before the D53 prioritization and still show features that moved to What's next (see Working agreement, rule 8).

## Project

PennyLane Support: a learner-first support platform for PennyLane coding challenges, built as a frontend take-home. Learners browse challenges, find answers and ask for help; an admin moderates threads and sees insights.

- **Primary focus:** the support system (Community list and Thread page). Challenges and Insights are secondary.
- **Viewer roles:** `learner` and `admin`, switched in the UI. Mentor, staff and support exist only as labels on posts and render as badges. They are not viewer roles.
- **Data:** `data/pennylane_coding_challenges.json` (120) and `data/pennylane_support_conversations.json` (800, 3,061 posts). Raw files are never edited.
- **Proof of concept:** prefer a small, well-tested, well-explained core over breadth. Every decision must be explainable to a review panel.

## Stack

- Vite (`@vitejs/plugin-react`) + React 19 + TypeScript (`strict: true`, no `any`)
- MUI (Material UI) with a custom theme, its peers `@emotion/react` and `@emotion/styled`, and `@mui/icons-material` for icons; MUI X Charts (free version) for charts
- React Router v7 (library mode) for routes and URL search params
- TanStack Query v5 for all server state
- MSW v2 as the mock backend, in the browser and in tests
- `react-markdown` for Markdown, raw HTML disabled, images left out, headings in a post shown as bold paragraphs
- Vitest + Testing Library (`react`, `user-event`, `jest-dom`) + jsdom for unit and component tests, with `vitest-axe` for axe checks in component tests; Playwright + `@axe-core/playwright` for end-to-end and accessibility
- ESLint (`typescript-eslint`, `eslint-plugin-react-hooks`) + Prettier
- Fonts via `@fontsource`: Atkinson Hyperlegible (all UI), JetBrains Mono (code blocks only)

Do not add a dependency that is not listed here without asking first, and record any approved addition in `DECISIONS.md`.

## Code style

ESLint enforces the first three rules and the test-name rules; rules 4 to 7 are checked in review; `npm run lint` fails on a violation.

1. **Function expressions** (`const fn = () => …`) for every function, components included. A declaration is allowed only where the language needs one (generators, overloads), each with a lint-disable comment that says why. Define helpers above the code that uses them.
2. **`type`, not `interface`,** unless a type can't do it. The one expected exception is MUI theme module augmentation (declaration merging), with a disable comment that says why.
3. **Tests live in a `__tests__` folder** next to the code they test: `src/domain/__tests__/normalize.test.ts`.
4. **One component per file, named after it.** A component that grows dense moves into a folder of its own name (`ConversationRow/ConversationRow.tsx`) with its parts beside it. Small helpers used only by that component sit above it in the same file.
5. **Styles file.** When a component's `sx` objects crowd its markup, they move to `<Name>.styles.ts` in the same folder and are imported by name.
6. **Render functions for early returns.** A component with several conditional returns (pending, error, a variant) keeps one line per case, `if (query.isPending) return renderPending()`, with the `render…` functions defined above it.
7. **Rendering cost.** Keep fast-changing state (a field being typed in, an open menu) inside the smallest component that needs it, so a keystroke never re-renders a list. Wrap a list item or a costly child (Markdown) in `memo` when its parent re-renders for reasons that do not concern it, and rely on TanStack Query's structural sharing to keep unchanged records the same objects. Measure before adding `useMemo` or `useCallback`; do not memoize cheap work.
8. **Test necessary behaviour only:** one test per distinct way the code can break. No test that repeats another test's assertion or checks a value that is only passed through.

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
  app/                     main.tsx (entry point), App
  router/                  routes.tsx
  theme/                   theme.ts: colour tokens, type scale, component overrides
  layouts/                 AppLayout, TopBar, SearchField, SidebarNav/ (SidebarNav with its NavRow, Categories and ChallengeCategories; the sidebar and the drawer share it); PageHeader/ (PageHeader with its CircuitMotif); hooks/ (useReturnToMainTop); shared/ (sharedSizes.ts, sharedStyles.ts)
  providers/               queryClient.ts; role/ (RoleProvider, RoleContext, useRole)
  domain/                  types, normalize.ts, permissions.ts (pure, no React)
    __tests__/             tests sit beside the code they test, in every folder
  mocks/
    db/                    load + normalize the JSON once into an in-memory store
    queries/               pure functions: filter, sort, paginate, aggregate
    handlers/              MSW handlers, thin wrappers around queries/
    browser.ts / node.ts   setupWorker / setupServer
  api/                     contract.ts (HTTP shapes), http.ts (apiGet, apiSend, ApiError), queryKeys.ts
    hooks/                 TanStack Query hooks per resource
  pages/                   one folder per route screen; components used by one page only sit in its folder, its hooks in hooks/
    community/             CommunityPage: list, intent tabs, ListPagination; hooks/useListParams (the list's URL state)
    thread/                ThreadPage: Q/A thread, reply, manage menu, context rail; ThreadHeader/ (ThreadHeader, Breadcrumb); shared/ (Byline, Helpful: used by the question, the accepted answer and the replies); Thread.styles.ts (the gutter and the markers)
    challenges/            ChallengesPage: CategoryRow (heading, arrows, the scrolling row), ChallengeCard, ChallengesSkeleton; Challenges.styles.ts
    insights/              InsightsPage: Tiles, StruggleList (the ranked list) with its StruggleListItem, MonthlyChart (chart and its table), InsightsSkeleton; Insights.styles.ts
    not-found/             NotFoundPage
  components/              shared UI and the design system: StatusChip, Avatar, ConversationRow/ (the row, its Votes, its skeleton and ConversationRow.styles.ts), TriageLine, BrandMark, RoleSwitcher
  error-handling/
    components/            EmptyState, ErrorState and the MessagePanel layout they share; InlineError for a refused action
  utils/                   small pure helpers (formatDate, plural, slug)
  test-utils/              setup, render helpers, fixtures (no tests)
public/                    mockServiceWorker.js (generated by `msw init`, committed)
e2e/                       Playwright specs
docs/                      requirements.md (what to build), wireframes/*.png, screenshots/*.png (one pair per screen at 1440 and 375 px, overwritten by each UI slice under the same names)
```

## Architecture rules

The request flow is: URL → component → TanStack Query hook → API client `fetch('/api/...')` → MSW handler → pure query function → in-memory store.

1. Components never import from `mocks/` or `data/`. They only use hooks from `api/hooks/`. `main.tsx` starts the mock worker and is the only app file that names `mocks/`.
2. MSW handlers stay thin: parse the request, call a pure function in `mocks/queries/`, return a status and JSON. Logic lives in the pure functions, which are unit-tested on their own.
3. Swapping in a real backend must only remove `mocks/`. No app code may depend on the mock.
4. Permissions live in one function, `can(role, action, context)` in `domain/permissions.ts`. The UI calls it to hide controls; handlers call it to return 403. Never duplicate permission logic.
5. The viewer's role is sent on every request as the `X-Mock-Role` header.
6. List state (search, category, tab, filters, page) lives in URL search params, never in component or global state. Routes: `/` Community list, `/threads/:id` thread, `/challenges`, `/insights`.
7. The only global client state is the current role: React context plus a `useRole()` hook, remembered in `localStorage`.
8. Data changes use a pending state, then invalidate the affected queries by the start of their keys (`STALE_AFTER_THREAD_CHANGE` in `api/queryKeys.ts`, which includes `["insights"]`), so both roles' cached answers refresh. No optimistic updates.
9. Handlers add a 200–500 ms delay in the browser and 0 ms in tests.
10. Insights metrics are computed in the mock server (`/api/insights`), never in the browser.

## Mock API contract

Paged list responses: `{ items, page, pageSize, total }`. `pageSize` max 50, default 20. The challenges list is grouped instead (D70).

| Method and path | Purpose | Rules |
| --- | --- | --- |
| `GET /api/conversations` | Paged list | `q`, `category`, `tab` (latest, unanswered, solved, attention), `challengeId`, `tag`, `priority`*, `assignee`*, `page`, `pageSize`. Ordered by latest activity; there is no `sort` parameter |
| `GET /api/conversations/:id` | Thread with posts | 404 if unknown |
| `POST /api/conversations` | Ask a question | 400 on missing fields |
| `POST /api/conversations/:id/posts` | Reply | 400 if empty; 409 if locked |
| `PATCH /api/conversations/:id` | status, assignee, priority, pinned, locked, acceptedPostId | 403 via `can()` |
| `GET /api/challenges` | Published challenges grouped by category, not paged: `{ categories: [{ name, challenges }] }`, each challenge with title, difficulty, one-line summary and open-question count | `q`, `difficulty`, `includeHidden` (admin only) |
| `GET /api/challenges/:id` | One challenge with open-question count | 404 if unknown; draft and archived are returned to every role |
| `GET /api/insights` | Aggregated metrics | 403 unless admin |
| `GET /api/meta` | The 13 community categories with thread counts, tags, assignees for menus | |

\* Ignored unless the role is admin. Since D53 no screen sends `tag`, `priority` or `assignee` (built and tested, they stay), and these are not built: `POST /api/conversations`, every PATCH field but `status`, and `q` and `difficulty` on the challenges list. The `attention` tab is admin only: open threads that are unassigned or high or urgent priority; a learner gets 403. A page past the end returns empty `items` with the real `total`. Unknown parameter values fall back to their defaults.

## Data normalization rules

Normalization runs once when the store loads. Every rule that changes data has a unit test in `domain/__tests__/normalize.test.ts`; a rule that keeps a value as given is held by the types. The counts below were checked against the data on Oct 8 and are documented, not pinned in tests; the one exception is the real-data check on the query functions (D38).

- The opening post is `post_id` 1, never the earliest timestamp: in 220 conversations a reply is dated before the question, while `created_at` and the description follow `post_id` 1 in every conversation (D35). Keep `created_at` as given.
- Sort the replies by timestamp (449 of 800 conversations are out of order); break ties by `post_id` (8 conversations).
- Order first. The opening post, the accepted answer, the description fallback and `lastActivityAt` are all derived from the ordered posts, and a test covers that order.
- Recompute `lastActivityAt` from the latest post by timestamp (267 conversations are wrong in the source).
- Keep `user_role` per post as "role at time of posting"; never derive a user's role (20 users have several roles).
- Missing `description` (60): fall back to the opening post's content.
- Strip embedded metadata from descriptions: the lines and table rows that restate status, priority, category, topic, tags or an internal ID (status and priority in 333 descriptions, an ID in 521). Priority is admin only and search reads the description, so none of it may reach a learner through display or search. Then remove what the stripping leaves behind: the "Triage notes" heading, a heading with nothing under it, an empty code fence and a bare line repeating the topic.
- Post content is never rewritten: 10 conversations mention a challenge ID in a sentence the asker typed, and it stays (D36).
- `points` may be a string (CHAL_022): convert to a number.
- Key everything on IDs. Topic titles repeat (723 of 800 share one) and challenge titles repeat. `post_id` is unique only inside its conversation, so a post is identified by conversation and `post_id` together.
- Keep `status` as given. "Answered" without an accepted answer (105) stays "answered".
- The accepted answer is never the opening post. When its author is the asker (20 conversations), label it "Solved by the asker".
- `assigned_to: null` means unassigned (164).
- Resolution metrics use resolved and closed conversations only (`resolution_time_hours` is null otherwise).
- Draft and archived challenges (18) are hidden from the challenge list by default; their conversations stay visible.

## UI and UX rules

- **Layout:** top bar (brand mark and name, search, role switcher); page content in one reading column of 760 px on the sheet, centred in the main area; the page header carries the circuit motif from 1200 px; a new page of a list lands at the top of main, with focus; labelled left sidebar (Community with its 13 categories, Challenges with its categories, Insights for admin). The active section expands. A page opened by a link starts at its top and Back returns to where the viewer was (React Router's `ScrollRestoration`). Search always searches questions and opens the Community list with `q`; on the list it keeps the category, tab and challenge and returns to the first page. On the Challenges page the Challenges entry expands to its 12 categories, each a link to that category's row on the page (`/challenges#category`).
- **Community list:** intent tabs Latest, Unanswered (status open), Solved (status resolved), plus Needs attention for admin, drawn as pills with the selected one filled in ink. Ordered by latest activity: no sort control, and pinned does not change the order. Row: vote count (display only), initials avatar, title, two-line excerpt (the opening post, cut by the server at a word boundary at 200 characters), status chip, challenge name, reply count, last activity; an admin's rows add priority and assignee. The whole row is one link. Above the rows one line gives the count ("800 questions", "12 results for “vqe”"); that same element is the live region. A `challengeId` in the URL shows as a removable chip, named by `GET /api/challenges/:id`. There is no "More filters": the list reads `q`, `category`, `tab`, `challengeId` and `page` from the URL and nothing else. Sidebar counts are totals from `/api/meta`. On a switch to Learner, drop the admin-only Needs attention tab and fall back to Latest. No "Ask a question" button until the ask form exists.
- **Thread page:** Q: marker and title; "N people have this question too" from the opening post's upvotes; accepted answer directly under the question, marked A:; other replies in time order; right rail with "About this challenge" from 1200 px, a compact strip under the header below that. From 900 px a gutter on the left holds Q:, A: and each reply's avatar on one line; the accepted answer is the one filled block (solved tint, solved bar on its edge), not an outlined card. An admin sees priority and assignee under the header, as on a list row. A reply written in the app is by `you`, posted as staff for an admin. The admin's one action, the status change, sits behind a ⋯ menu. The sidebar is hidden on this page; the top bar's menu button opens it as a drawer, and the breadcrumb keeps the place. Tags sit in the header. One reply form, at the bottom. An answered thread without an accepted answer says "No accepted answer" (thread page only). The rail marks a hidden challenge "Archived challenge" or "Draft challenge" as text.
- **Challenges:** a row of white cards per category, each with a soft shadow, on a band of canvas that runs to the sheet's edges, with a faint shadow at an edge that hides more cards, scrolled with labelled arrow buttons, a swipe or Tab; each card shows title, difficulty, a one-line summary and its open-question count, and opens the Community list filtered to that challenge. A card with 3 or more open questions stands out: a waiting bar on its edge and its count in waiting on the waiting tint. The page has no difficulty filter, no search of its own and no challenge detail page. A repeated challenge title shows its category beside it, on cards and in the thread rail.
- **Insights:** four tiles as one ruled strip, then "Where learners struggle" (a ranked list of the top 8 challenges by open threads, with inline bars; each row links to that challenge's unanswered questions) and "New conversations per month" (a bar chart with a "Show as table" under it), each with a one-line text summary computed from the data.
- **Responsive:** MUI breakpoints. Below 900 px the sidebar becomes a temporary Drawer opened from a menu button, listing all 13 categories and holding the role switcher (which sits in the top bar at 900 px and wider); every screen is one column (the thread's rail is already a strip below 1200 px); list rows keep the challenge name and last activity; the thread's Reply button stays pinned to the bottom and scrolls to the reply form.
- **Theme:** light, in three layers: an ink top bar, a canvas #F4F5F9 behind the navigation, and the page on a white sheet (paper #FFFFFF) with a soft shadow; on a phone the sheet is the whole screen. Ink #1E2533, action #3D45C4, solved #157A55, waiting #9A5B00, error #B3261E, rules #DDE1E7. On the top bar: field #343B47, control edge #8A93A8, hint #B8C0D0, accent and focus ring #A9B1FF. Muted text #566074 (counts, hints, placeholders). Input border #737D8F for fields and outlined controls; rules are for separators only. Chip tints: solved #EDF3F3, waiting #F5F1EE (the status colour at 6% on paper). Current page in the pager #ECECF9, hovered row #F0F0F3; the current navigation row is white on the canvas with an action bar on its edge. The vote block is canvas. Chip edges are the status colour at 35% (solved #AACEC2, waiting #D9C3A4, neutral #C1C5CD). Six avatar tints. Type scale: 13, 15, 16, 17, 20, 30 px. All tokens live in `src/theme/theme.ts`; components never hard-code a colour. Lists are rows separated by rules, not stacks of cards.
- **Status colours:** Open = waiting, Answered = neutral grey, Resolved = solved, with ✓ only when there is an accepted answer, Closed = grey outline. Action blue is for links and buttons, never for status.
- **Copy:** sentence case, plain words from the learner's side ("Ask a question", "Try again"). No internal IDs on screen. Errors say what happened and what to do.
- **Votes and helpful counts are display only.**
- **Visual design:** Wireframes define structure and content, not visual design. The visual design must be production quality: use the frontend-design skill for every UI slice. Colour tokens and fonts may be refined if contrast is re-checked. Shared visual pieces (status chip, avatar, row, page header, empty/error states) are built once as a design system and reused. Every UI reading guide includes screenshots at 1440 px and 375 px.

## Accessibility rules (target WCAG 2.2 AA)

- Semantic HTML first; ARIA only where HTML falls short. Landmarks and a logical heading order on every page.
- Everything works with a keyboard, with a visible focus ring.
- Status always pairs color with a word. Contrast at least 4.5:1 for text.
- Announce result counts and errors through a live region.
- Tabs use MUI Tabs (proper tablist). The mobile Drawer traps focus, closes on Esc and returns focus to its trigger.
- Decorative icons and avatars are hidden from screen readers.
- Respect `prefers-reduced-motion`.
- Every UI slice, without being asked:
  - Each screen-level component test asserts no axe violations with `expectNoAxeViolations` from `src/test-utils/axe.ts`. jsdom cannot check colour contrast, so that rule is off there.
  - Any new text or status colour pair is checked against 4.5:1 (3:1 for control borders and focus rings), and the ratios are listed in the reading guide.
  - The reading guide comes with a manual accessibility checklist for the slice: what to try with the keyboard, in VoiceOver, at 200% zoom and at 375 px. Only what automation cannot cover.

## Testing rules

- Unit tests: `domain/` (normalize, permissions) and `mocks/queries/` (filter, sort, paginate, insights).
- Component tests: render through the real MSW handlers (via `setupServer`), not mocked hooks. Cover list filtering and tabs, replying, role gating and a 403 shown to the user.
- One Playwright run: filter the list, open a thread, reply. Run an axe check on each main page.
- Name tests after behaviour in plain words: `it('hides priority from learners')`. Requirement IDs stay in commit messages, not in test names or describe blocks.
- No printf placeholders (`%s`) in test names. For `it.each` use objects with `$name`, or write separate tests when there are only two or three cases.
- Never weaken or delete a test to make it pass. A failing test means fix the code or ask.

## Working agreement for agents

1. **Plan first.** Before each slice, outline the files you will touch and the tests you will add, then wait for approval.
2. **One slice per commit.** Keep diffs small and focused on one requirement or milestone step.
3. **Commit messages:** Conventional Commits with the reason in the body, for example `feat(community): add intent tabs (FR-4)` followed by why.
4. **Definition of done:** `npm run check` passes, new behaviour has a test, no TypeScript errors, no lint warnings.
5. **Decisions:** when you choose between real alternatives, add a row to `DECISIONS.md` (decision, rejected, why).
6. **Ask, don't assume,** when a requirement is unclear or two rules conflict.
7. **Don't touch** `data/` raw files, and don't change the API contract or folder structure without asking.
8. **Stay in scope.** Out of scope: authentication, real voting, a moderator role, dark theme, optimistic updates, search on the Challenges page. Moved to What's next (D53), do not build: More filters (tag, challenge picker, priority, assignee); admin actions other than the status change (assign, priority, pin, lock); learner accept-answer and mark-solved (FR-12) and the demo learner (D29); related threads; the challenge detail page and the difficulty filter; the Insights charts "conversations by status" and "resolution time by category"; the ask form; sessionStorage persistence. Something worth adding goes under "Suggested, not included" in the plan, not into the diff. If scope must shrink further, in order: the two charts, then the admin's status change. The Challenges page is a brief requirement and is never cut.
9. **Review before commit.** When `npm run check` passes, do not commit. Present: (1) a reading guide: the 3–5 files to read first, in order, with one line each on what to look for and how the request flows through them; (2) the proposed commit message. Wait for my review and approval before committing.
10. **After a commit, stop.** Never start the next slice without a new, approved plan.
