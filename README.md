# Workout Log

[![CI](https://github.com/jray89/workout-log/actions/workflows/ci.yml/badge.svg)](https://github.com/jray89/workout-log/actions/workflows/ci.yml)

A workout tracker for logging strength and cardio sessions set by set, then seeing progress over time: streaks against a weekly goal, personal records, per-exercise weight charts and a GitHub-style activity heatmap.

It's a Rails 8 JSON API and a React 19 + TypeScript SPA, shipped as a single Docker image. This is a v2 rewrite of a 2021 PHP/Angular prototype.

<!-- TODO: add a live demo link once workoutlog.jasonray.me points at the Railway deployment -->

<!-- TODO: add screenshots (dashboard with heatmap, an in-progress workout)
## Screenshots

| Dashboard | Logging a workout |
|---|---|
| ![Dashboard](docs/dashboard.png) | ![Workout](docs/workout.png) |
-->

## Features

- **Session logging**: add exercises from a shared library, log sets with weight, reps and RPE, and tick sets off as you go
- **Strength and cardio**: cardio sessions track distance instead of sets
- **Repeat workouts**: duplicate a past session as a template, and pin favorites to the top
- **Dashboard**:
  - current and longest streak against a configurable weekly goal
  - week-over-week workout count and volume
  - recent PRs
  - muscle-group breakdown
  - 13-week activity heatmap
  - workout-count milestones
- **Progress charts**: max weight over time for each exercise
- **Accounts**: JWT auth, an admin role for curating the shared exercise library, and light/dark/system themes

## Tech stack

| Area | Tools |
|---|---|
| Backend | Ruby 3.3, Rails 8.1 (API-only), JWT, bcrypt |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, Recharts |
| Database | SQLite (dev/test), PostgreSQL (production) |
| Testing | Minitest request/model tests, Vitest |
| Tooling | RuboCop (rails-omakase), Brakeman, bundler-audit, ESLint, GitHub Actions, Dependabot |
| Deployment | Multi-stage Docker build on Railway |

## Architecture notes

- **One deployable.** The Dockerfile builds the SPA and copies it into Rails' `public/`. Puma serves both the API and the static app, and a fallback route hands non-API paths to `index.html` for client-side routing.
- **Stateless auth.** Rails issues an HS256 JWT signed with `secret_key_base` (24-hour expiry). The client stores it and attaches it as a bearer token. On a 401 the client clears it and redirects to `/login`.
- **Per-user data scoping.** Every query goes through `current_user` (`current_user.workout_sessions.find(...)`), so another user's record returns the same 404 as a missing one. The test suite checks this across sessions and nested sets.
- **No serializer gem.** Each controller builds its JSON with small `*_json` helpers, which keeps responses explicit and easy to follow.
- **Server-side dashboard.** A single `/api/v1/dashboard` call returns the streak, weekly totals, PRs and heatmap data, so the client doesn't fetch every session to compute stats.

## Running locally

Prerequisites: Ruby 3.3.6, Node 22, pnpm 10.

```bash
# Backend (http://localhost:3000)
cd backend
bundle install
bin/rails db:prepare db:seed
bin/rails server

# Frontend (http://localhost:5173), proxies /api to :3000
cd frontend
pnpm install
pnpm dev
```

To make a user an admin, run `bin/rails "admin:grant[you@example.com]"`.

## Tests and checks

```bash
# Backend
cd backend
bin/rails test        # Minitest: models, JWT service, API requests
bin/rubocop           # style
bin/brakeman          # static security analysis
bin/bundler-audit     # known-vulnerable gems

# Frontend
cd frontend
pnpm test             # Vitest
pnpm lint             # ESLint
pnpm build            # type-check + production build
```

CI runs all of the above on every push and pull request (`.github/workflows/ci.yml`).

## Project structure

```
workout-log/
├── backend/                  # Rails API
│   ├── app/controllers/api/v1/
│   ├── app/models/
│   ├── app/services/         # JwtService
│   ├── db/                   # migrations, schema, exercise-library seeds
│   └── test/                 # models, services, integration (request) tests
├── frontend/                 # React SPA
│   └── src/
│       ├── components/       # feature components, providers, shadcn/ui primitives
│       ├── hooks/            # useAuth, useTheme
│       ├── lib/              # API client + types, pure helpers (with tests)
│       └── pages/
├── Dockerfile                # builds the SPA and the Rails image
└── railway.json
```

## License

[MIT](LICENSE)
