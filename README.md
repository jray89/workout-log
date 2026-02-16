# Workout Log

A personal workout tracking app for logging sessions, exercises, and sets with progress tracking over time.

**Live at**: workoutlog.jasonray.me

## Tech Stack

- **Backend**: Ruby on Rails 8.1 (API-only) with JWT authentication
- **Frontend**: React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: SQLite3 (dev/test), PostgreSQL (production)
- **Deployment**: Railway via Docker

## Development

### Prerequisites
- Ruby 3.3.6
- Node.js 20+
- pnpm
- Bundler

### Getting Started

```bash
# Backend (http://localhost:3000)
cd backend
bundle install
rails db:create db:migrate db:seed
rails server

# Frontend (http://localhost:5173)
cd frontend
pnpm install
pnpm dev
```

The Vite dev server proxies `/api` requests to the Rails server on port 3000.

### Production Build

```bash
./scripts/build-frontend.sh
```

This builds the React app and copies the output into `backend/public/` so Rails serves both the API and the SPA.

## Project Structure

```
workout-log/
├── backend/          # Rails API application
│   ├── app/
│   │   ├── controllers/api/v1/   # API endpoints
│   │   ├── models/               # ActiveRecord models
│   │   └── services/             # JwtService
│   └── db/
│       ├── migrate/              # Database migrations
│       ├── seeds.rb              # Exercise library seed data
│       └── schema.rb             # Current schema
├── frontend/         # React SPA
│   └── src/
│       ├── components/           # UI components
│       ├── hooks/                # useAuth context
│       ├── lib/                  # API client + types
│       └── pages/                # Route pages
├── Dockerfile        # Multi-stage production build
├── railway.json      # Railway deployment config
└── scripts/          # Build utilities
```
