# Backend — Rails API

Rails 8.1 API-only application serving the workout-log REST API.

## Setup

```bash
bundle install
rails db:create db:migrate db:seed
rails server  # http://localhost:3000
```

## Database

- **Dev/Test**: SQLite3 (stored in `storage/`)
- **Production**: PostgreSQL via `DATABASE_URL` env var

Seeds populate the built-in exercise library (24 common exercises). Run `rails db:seed` — it's idempotent.

## API Endpoints

All routes are under `/api/v1/`. Authentication required unless noted.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Create account (no auth) |
| POST | `/login` | Get JWT token (no auth) |
| GET | `/me` | Current user info |
| GET | `/exercises` | List all exercises |
| POST | `/exercises` | Create custom exercise |
| GET | `/exercises/:id/history` | Weight history for an exercise |
| GET | `/workout_sessions` | List user's sessions |
| POST | `/workout_sessions` | Create session |
| GET | `/workout_sessions/:id` | Get session with exercises and sets |
| PATCH | `/workout_sessions/:id` | Update session |
| DELETE | `/workout_sessions/:id` | Delete session |
| POST | `/workout_sessions/:id/duplicate` | Duplicate session structure |
| POST | `/workout_sessions/:id/workout_session_exercises` | Add exercise to session |
| DELETE | `/workout_sessions/:id/workout_session_exercises/:id` | Remove exercise |
| POST | `.../workout_session_exercises/:id/exercise_sets` | Add set |
| PATCH | `.../exercise_sets/:id` | Update set |
| DELETE | `.../exercise_sets/:id` | Delete set |

## Admin Users

Users have an `admin` boolean flag (default `false`). Manage via rake tasks:

```bash
rake admin:grant[user@example.com]    # Promote to admin
rake admin:revoke[user@example.com]   # Remove admin
```

The `require_admin!` method in `ApplicationController` can be used as a `before_action` to restrict actions to admins (returns 403). Auth responses (`/login`, `/signup`, `/me`) include the `admin` field.

## Key Patterns

- **Auth**: JWT via `Authorization: Bearer <token>`. `ApplicationController#authenticate_user!` runs on all actions. Controllers skip it explicitly for public endpoints.
- **Admin authorization**: `require_admin!` available as a `before_action` for admin-only endpoints (returns 403).
- **Data isolation**: All queries scoped to `current_user` — users only see their own workout data. The exercise library is shared.
- **Serialization**: Inline `*_json` helper methods in controllers (no serializer gem).
- **Passwords**: bcrypt via `has_secure_password`.
