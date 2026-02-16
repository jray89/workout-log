# Plan: Add Admin Users

## Overview
Add the concept of admin users to the workout-log app with a simple boolean flag on the users table, a rake task for promoting/demoting users, and backend authorization infrastructure.

## Steps

### 1. Database migration: add `admin` column to `users`
- Generate a migration to add `admin:boolean` to users, default `false`, not null
- Run `rails db:migrate`

### 2. Update User model
- No special model changes needed (the column is enough for `user.admin?`)
- Optionally add a scope like `scope :admins, -> { where(admin: true) }` for convenience

### 3. Create rake task for granting/revoking admin
- `lib/tasks/admin.rake` with two tasks:
  - `rake admin:grant[email]` — finds user by email, sets `admin: true`
  - `rake admin:revoke[email]` — finds user by email, sets `admin: false`
- Prints clear success/error messages
- This is how you bootstrap the first admin: sign up normally, then run the rake task

### 4. Add admin authorization helper to ApplicationController
- Add a `require_admin!` method that returns 403 if `!current_user.admin?`
- Controllers/actions that need admin access call `before_action :require_admin!`

### 5. Expose admin status in auth responses
- Update the `me` endpoint and login/signup responses to include `admin: true/false`
- Update the `UserSerializer` (or inline serialization) to include the field

### 6. Frontend: expose admin flag in auth context
- Update the TypeScript `User` type to include `admin: boolean`
- Store it in the auth context so components can check `user.admin`
- No admin UI yet — this just makes the flag available for future use

## What this does NOT include (future work)
- Admin-only UI pages or routes
- Specific admin-only API endpoints (those come when we have features that need them)
- Role-based access control beyond admin/not-admin

## First admin workflow
1. Deploy the migration
2. Sign up or log in as your normal user
3. Run: `rake admin:grant[your-email@example.com]`
4. You're now an admin
