# Frontend — React SPA

React 19 + TypeScript single-page application built with Vite, Tailwind CSS, and shadcn/ui.

## Setup

```bash
pnpm install
pnpm dev    # http://localhost:5173
```

The Vite dev server proxies `/api` requests to the Rails backend on `localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | TypeScript check + Vite production build |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build locally |

## Project Structure

```
src/
├── App.tsx                    # Router setup with ProtectedRoute/GuestRoute
├── main.tsx                   # Entry point (AuthProvider + ThemeProvider)
├── lib/
│   └── api.ts                 # API client, all fetch calls, TypeScript interfaces
├── hooks/
│   └── useAuth.tsx            # Auth context (user state, login/signup/logout)
├── pages/
│   ├── DashboardPage.tsx      # Session list, pinned workouts
│   ├── WorkoutPage.tsx        # Active workout with exercises and sets
│   ├── LoginPage.tsx          # Login form
│   └── SignupPage.tsx         # Signup form
├── components/
│   ├── SessionCard.tsx        # Workout session summary card
│   ├── ExerciseCard.tsx       # Exercise with sets in a workout
│   ├── ExerciseHistoryCard.tsx # Weight progress chart
│   └── theme-provider.tsx     # Dark/light theme context
└── components/ui/             # shadcn/ui primitives (button, card, input, etc.)
```

## Key Patterns

- **Auth**: JWT token stored in `localStorage`. The `useAuth` hook provides `user`, `login`, `signup`, `logout`. The API client auto-attaches the token and redirects to `/login` on 401.
- **Routing**: `ProtectedRoute` redirects to `/login` if unauthenticated. `GuestRoute` redirects to `/` if already logged in.
- **Path alias**: `@/` resolves to `src/` (configured in `vite.config.ts` and `tsconfig`).
- **API types**: All interfaces (`User`, `Exercise`, `WorkoutSession`, etc.) are defined in `src/lib/api.ts`.
