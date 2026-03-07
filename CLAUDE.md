# Project Instructions for Claude

## App Overview
Gym · Nutrition · Macro tracking application called **Theron**.
- **Stack:** React Native + TypeScript + Expo
- **Backend:** Supabase (auth + database)
- **Branch convention:** feature branches off `main`

## Code Conventions

### File & Folder Structure
- Each page lives in its own folder: `src/pages/<PageName>/`
- Each page folder contains:
  - `index.tsx` — the component
  - `<PageName>.styles.ts` — styles (same name as component, same folder)
- Each component lives in `src/components/<ComponentName>/` or `src/components/<ComponentName>.tsx`
- All database calls must be extracted into a separate function file (e.g. `src/lib/api/<entity>.ts`) and imported into the component — never inline Supabase calls inside components directly

### Styling
- Always use the color palette from `src/constants/theme.ts` (`COLORS`)
- Styles must be consistent across all pages
- `AppInput` sizes: `small` | `large` | `xlarge`

### Database
- SQL migrations go in `supabase/migrations/` with numeric prefix: `001_`, `002_`, etc.
- All tables must have RLS enabled
- `profiles` table is the source of truth for user fitness data
- `is_onboarded` flag on `profiles` controls post-auth routing

### Documentation
- Every new page must be added to `README.md`

## Key Files
- `src/app/index.tsx` — root router (loading → auth → onboarding → home)
- `src/lib/auth/AuthProvider.tsx` — auth context
- `src/lib/utils/supabase.ts` — Supabase client
- `src/constants/theme.ts` — colors, spacing, typography
- `src/pages/Onboarding/index.tsx` — multi-step onboarding (saves to `profiles`)

## Database Schema Summary
- `profiles` — user identity + all onboarding fitness data + macro targets + `is_onboarded`
- `body_measurements` — weight/body fat history
- `food_logs` — daily food macro tracking per meal
- `workout_sessions` — workout sessions
- `workout_exercises` — exercises within a session

## What NOT to do
- Do not inline Supabase queries in components
- Do not skip RLS on new tables
- Do not add styles inline in components — always use the `.styles.ts` file
- Do not create new files unless necessary
- Do not write code that is not documented
- Do not write code that is not secure