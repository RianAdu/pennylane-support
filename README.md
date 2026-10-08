# PennyLane Support

A learner-first support platform for PennyLane coding challenges, built as a frontend proof of concept. Learners browse challenges, find answers and ask for help; an admin moderates threads and sees insights. The backend is mocked in frontend code.

This README is a stub. Assumptions, architecture and trade-offs are added as the build progresses.

## Setup

Requires Node 22.13 or later (24 recommended).

```sh
npm install
npm run dev
```

## Scripts

| Command             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the app                                       |
| `npm run build`     | Type-check and build                                |
| `npm test`          | Unit and component tests (Vitest)                   |
| `npm run lint`      | ESLint, no warnings allowed                         |
| `npm run typecheck` | TypeScript, no output                               |
| `npm run check`     | lint + typecheck + test; passes before every commit |
| `npm run format`    | Prettier                                            |

## Documentation

- [docs/requirements.md](docs/requirements.md): what is being built, with wireframes, the mock API contract and milestones
- [DECISIONS.md](DECISIONS.md): each choice between real alternatives, what was rejected and why
- [AGENTS.md](AGENTS.md): conventions for any AI coding agent working in this repository

## What's next

Out of scope for the proof of concept:

- Search on the Challenges page
- A moderator role between learner and admin
- Working votes and helpful counts (display only today)
- A dark theme
