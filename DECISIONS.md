# Decisions

Every choice between real alternatives, with what was rejected and why. Scope, roles and data scale were left open on purpose by the hiring team, so these decisions are part of the assessment. Requirements live in `docs/requirements.md`; agent rules in `AGENTS.md`.

**Adding a decision:** append a row with the next ID. If a decision is reversed, don't delete the row; add a new one and note the change under History.

## Decision log

| # | Area | Decision | Rejected | Why |
| --- | --- | --- | --- | --- |
| D1 | Primary user | Learner-first community; the admin moderates on the same screens | Staff triage inbox; separate learner and staff areas | The brief says the platform "enables learners to seek help, share knowledge". One set of screens fits the time. |
| D2 | Roles | Two viewer roles: learner and admin. Mentor, staff and support stay as badges on posts | Four roles from the data; single mock user; fake login | The brief names learners and an admin. Extra roles cluttered every screen. Permissions live in one table, so a moderator role later is one new row, not new screens. |
| D3 | Navigation | A labelled left sidebar: Community with its 13 categories, then Challenges, plus Insights for the admin | Challenge-first navigation; top tabs; an icon-only rail | The brief makes support the primary focus, so threads are home. Every challenge card leads into its threads. Categories become a browsing path, as on the real forum, and labels keep navigation accessible. |
| D4 | Design reference | Content model from the PennyLane forum and challenges page; design inspiration for layout patterns from the PennyLane forum and various online forums | Copying an existing layout; a generic admin dashboard | The data mirrors both real products. Today help and challenges live on separate sites; connecting them is the improvement. |
| D5 | Data scale | Server-style API: the mock server filters, sorts and paginates | Load everything, filter in the browser | The brief asks for "larger datasets". The UI only ever holds one page, so it scales unchanged. |
| D6 | Framework | Vite + React + TypeScript | Next.js App Router | A client-side app against mocked APIs gains nothing from server rendering. MUI needs extra setup in the App Router, so the simpler stack wins. Next.js stays the right choice for content pages like pennylane.ai. |
| D7 | Mock API | Mock Service Worker (MSW) | Next.js Route Handlers; importing JSON directly | Mocks live in frontend code, as the brief asks. The app makes real `fetch` calls, so a real backend replaces only the mock. The same handlers run in tests. Importing JSON directly would hide how a server behaves. |
| D8 | Server state | TanStack Query | `useEffect` plus state; Redux | Caching, loading and error states, keeping the previous page while the next loads, refetching after a change. |
| D9 | URL state | Search, filters, sort and page in URL search params (React Router) | Component state; a global store | Views are shareable and bookmarkable, and the back button works. |
| D10 | Client state | React context for the current role only | Zustand, Redux | Only one piece of global client state exists, and every screen depends on it, so a full re-render on change is correct. Components use a useRole() hook, so moving to Zustand later changes one file. In production the role comes from the session and becomes server state. |
| D11 | UI library | MUI with a custom theme | Tailwind | Accessible components out of the box: focus handling, ARIA, keyboard support. The theme acts as design tokens. |
| D12 | Charts | MUI X Charts (free version) | Recharts, D3 | Uses the same theme as the rest of the UI, so less styling work. |
| D13 | Markdown | `react-markdown`, raw HTML disabled | `dangerouslySetInnerHTML` | Descriptions are Markdown. Not rendering raw HTML closes the XSS door. |
| D14 | Data changes | Pending state, then refetch | Optimistic updates | These are moderation actions the server can refuse (403, 409). Optimistic updates would show a change and then undo it, and need rollback code for the list and detail caches. A short pending state is honest and simpler. Optimistic updates fit high-frequency, low-risk actions like upvotes, which are out of scope. |
| D15 | Testing | Vitest + Testing Library, MSW in tests, one Playwright run | Jest, Cypress | Vite-native, and the mock server is reused across all test layers. |
| D16 | Data normalization | Normalize once when the mock store loads; raw JSON never edited; every rule unit-tested | Editing the JSON; fixing data in components | The data has deliberate inconsistencies (see requirements, Data findings). Fixing them in one tested place keeps components simple and makes the rules reviewable. |
| D17 | List tabs | Intent tabs: Latest, Unanswered, Solved (+ Needs attention for admin); other filters behind "More filters" | A status dropdown and a full filter bar | Tabs match what a learner wants ("has someone solved this?"); five statuses in a dropdown expose the data model, not the user's intent. |
| D18 | Thread layout | Answer-first: Q:/A: markers, accepted answer directly under the question, "N people have this question too" | Plain chronological forum thread | A learner arrives to find the answer. Putting it second, not buried in replies, is the one bold design idea. |
| D19 | Votes | Display only (opening post's upvotes, helpful counts) | Working upvotes | Voting is a new data change with its own rules; out of scope for a proof of concept. Listed under What's next. |
| D20 | Theme | Light theme; Atkinson Hyperlegible for UI, JetBrains Mono for code | Dark theme first | Long threads read best on light; the font supports the accessibility story. MUI makes dark mode cheap later. |
| D21 | Mobile navigation | Below 900 px the sidebar becomes a temporary MUI Drawer behind a menu button | A dropdown menu | 15+ items would make a long scrolling dropdown. The Drawer shares one component with the desktop sidebar and gives focus trap, Esc and focus return for free. |
| D22 | Agent instructions | `AGENTS.md` holds all rules; `CLAUDE.md` imports it with `@AGENTS.md` | Rules only in `CLAUDE.md` | The reviewers may use any coding agent. `AGENTS.md` is the cross-tool convention; Claude Code reads `CLAUDE.md`, which imports it, so there is one source of truth. |

## History

How the plan changed during planning (Oct 6–7, 2026), and why. Useful context for anyone wondering why the obvious option wasn't taken.

| Date | Change | Reason |
| --- | --- | --- |
| Oct 6 | Next.js App Router → Vite + React (D6) | Considered Next.js with Route Handlers as the mock API. Rejected: no SSR benefit for a client app on mocked data, and extra MUI setup in the App Router. |
| Oct 6 | Route Handlers → MSW (D7) | MSW keeps mocks in frontend code, as the brief asks, and the same handlers run in Vitest and Playwright. |
| Oct 6 | Tailwind → MUI (D11) | Accessible components out of the box: focus handling, ARIA, keyboard support. |
| Oct 6 | Filtering moved from browser to mock server (D5) | The brief mentions larger datasets; the UI should never hold more than one page. |
| Oct 6 | Four viewer roles (learner, mentor, staff, admin) → two (D2) | The first wireframes showed every extra role added controls to every screen without a story the brief asks for. Mentor/staff/support became post badges. |
| Oct 6 | Top tabs → labelled left sidebar (D3) | Categories are the real forum's browsing path; labels beat icons for accessibility. |
| Oct 7 | Redrew list and thread wireframes (D4, D17, D18) | First versions looked like an admin console: dense tables, status dropdown, every field visible. Rebuilt around one user job per screen, with layout patterns inspired by the PennyLane forum and various online forums. |
| Oct 7 | Status dropdown → intent tabs (D17) | Learners think "unanswered" or "solved", not in five statuses. |
| Oct 7 | Vote box restyled as a tinted block (D19) | The bordered box read as a button while votes are display only. |
| Oct 7 | Sidebar on every page; thread page collapses it (D3) | Challenges and Insights needed the same navigation; the thread needs width for reading, the breadcrumb keeps the place. |
| Oct 7 | Responsive rules and phone wireframes added (D21) | Defined the 900 px drawer breakpoint and one-column layouts; only list and thread change structure on phones. |
| Oct 7 | "Show the ID next to the title" dropped | Titles repeat (723 of 800), but internal IDs mean nothing to learners. Rows are distinguished by excerpt, challenge and date; code keys on `identifier`. |
| Oct 7 | `CLAUDE.md` → `AGENTS.md` + import (D22) | Reviewers may use a different coding agent. |

## Added during the build

| # | Area | Decision | Rejected | Why |
| --- | --- | --- | --- | --- |
