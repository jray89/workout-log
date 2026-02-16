# CLAUDE.md

## Project Overview

Workout-log is a personal workout tracking app. Users log workout sessions, add exercises with sets (weight/reps/RPE), and track progress over time.

- **Backend**: Ruby on Rails 8.1 API-only app (`backend/`)
- **Frontend**: React 19 + TypeScript SPA with Tailwind CSS and shadcn/ui (`frontend/`)
- **Database**: SQLite3 (dev/test), PostgreSQL (production)
- **Deployment**: Railway via Docker multi-stage build. Domain: workoutlog.jasonray.me

## Development Setup

```bash
# Backend (runs on :3000)
cd backend
bundle install
rails db:create db:migrate db:seed
rails server

# Frontend (runs on :5173, proxies /api to :3000)
cd frontend
npm install
npm run dev
```

## Key Commands

```bash
# Backend
cd backend && rails server              # Start API server
cd backend && rails db:migrate          # Run pending migrations
cd backend && rails db:seed             # Seed exercise library
cd backend && rails console             # Rails console

# Frontend
cd frontend && npm run dev              # Dev server with HMR
cd frontend && npm run build            # Production build (tsc + vite)
cd frontend && npm run lint             # ESLint

# Production build (copies frontend into backend/public/)
./scripts/build-frontend.sh
```

## Architecture

### Authentication
- JWT-based (stateless), 24-hour token expiry, HS256 signing
- Token sent via `Authorization: Bearer <token>` header
- `ApplicationController` enforces `authenticate_user!` on all endpoints
- `JwtService` handles encode/decode (`backend/app/services/jwt_service.rb`)

### API Structure
All routes under `/api/v1/`:
- `POST /signup`, `POST /login`, `GET /me` — auth (skip auth filter)
- `GET/POST /exercises`, `GET /exercises/:id/history` — exercise library + history
- CRUD `/workout_sessions` + `POST :duplicate`
- Nested: `/workout_sessions/:id/workout_session_exercises` and `/exercise_sets`

### Data Model
```
User
  has_many :workout_sessions
  has_many :exercises (custom ones, via created_by_id)

Exercise (shared library + user-created custom exercises)
  belongs_to :created_by (User, optional)

WorkoutSession
  belongs_to :user
  has_many :workout_session_exercises (ordered by position)

WorkoutSessionExercise (join table)
  belongs_to :workout_session
  belongs_to :exercise
  has_many :exercise_sets

ExerciseSet
  belongs_to :workout_session_exercise
  fields: set_number, reps, weight, completed, rpe
```

### Data Access Pattern
All controllers scope queries to `current_user` — users only see their own data. The exercise library (non-custom) is shared across all users.

### Frontend Structure
- `src/App.tsx` — routes with `ProtectedRoute` / `GuestRoute` wrappers
- `src/hooks/useAuth.tsx` — auth context (user state, login/signup/logout)
- `src/lib/api.ts` — API client + all TypeScript interfaces
- `src/pages/` — DashboardPage, WorkoutPage, LoginPage, SignupPage
- `src/components/` — SessionCard, ExerciseCard, ExerciseHistoryCard
- `src/components/ui/` — shadcn/ui primitives (button, card, input, etc.)
- Uses `@/` path alias (resolves to `src/`)

### JSON Serialization
Controllers use inline `*_json` helper methods (e.g. `session_json`, `user_json`) — no serializer gem. Keep this pattern when adding new endpoints.

## Conventions
- No test suite yet — no tests to run
- No serializer library — use inline `*_json` methods in controllers
- Seeds only populate the built-in exercise library (not users)
- Frontend uses Vite dev proxy (`/api` -> `localhost:3000`)
- No role/permission system yet (planned — see plan.md)

## Documentation
When adding new features, update the relevant documentation files to keep them current:
- **CLAUDE.md** (this file) — update Architecture, Data Model, API Structure, Frontend Structure, or Conventions sections as needed
- **README.md** (root) — update if the tech stack, setup steps, or project structure change
- **backend/README.md** — update the API endpoint table and Key Patterns when adding/changing endpoints
- **frontend/README.md** — update the Project Structure and Key Patterns when adding new pages, components, or hooks
