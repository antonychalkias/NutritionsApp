# Theron — Gym, Nutrition & Macro Tracker

React Native + TypeScript + Expo fitness app for tracking workouts and food macros, backed by Supabase.

---

## Pages

Each page has its own folder under `src/pages/<PageName>/` containing `index.tsx` and `<PageName>.styles.ts`.

| Page | Path | Description |
|------|------|-------------|
| Loading | `src/pages/Loading/` | Splash screen — checks network and Supabase connectivity |
| Auth | `src/pages/Auth/` | Login and registration (email/password + Google/Apple OAuth) |
| Onboarding | `src/pages/Onboarding/` | 4-step fitness profile setup: name/age → body stats → goal → activity level. Saves to Supabase and sets `is_onboarded = true` |
| Error | `src/pages/Error/` | No-connection error screen with retry |

---

## Entry Point

The application starts from `src/app/index.tsx`. On load it checks the Supabase connection, reads the session, and routes to:
- `onboarding` — if session exists but `is_onboarded = false`
- `home` — if session exists and `is_onboarded = true`
- `auth` — if no session

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start -e src/app/index.tsx
   ```

You can start developing by editing the files inside the **src/pages** directory. This project uses a custom entry point and page structure.

## Structure

```
src/
├── app/index.tsx              # Root router
├── pages/
│   ├── Loading/               # index.tsx + Loading.styles.ts
│   ├── Auth/                  # index.tsx + Auth.styles.ts
│   ├── Onboarding/            # index.tsx + Onboarding.styles.ts
│   └── Error/                 # index.tsx + Error.styles.ts
├── components/
│   └── AppInput.tsx           # Shared input — sizes: small | large | xlarge
├── lib/
│   ├── api/
│   │   └── profiles.ts        # All profiles DB calls (upsertProfile, getProfileIsOnboarded)
│   ├── auth/
│   │   └── AuthProvider.tsx   # Auth context
│   └── utils/
│       ├── supabase.ts        # Supabase client
│       └── checks.ts          # Network + connectivity helpers
├── constants/
│   └── theme.ts               # COLORS palette and design tokens
└── assets/                    # Logos, icons
```

### Database migrations (`supabase/migrations/`)

| File | Description |
|------|-------------|
| `001_enable_rls_profiles.sql` | `profiles` table + RLS policies |
| `002_secure_public_users.sql` | Secures legacy `public.users` if present |
| `003_fitness_schema.sql` | Fitness columns on profiles, auto-create trigger, `body_measurements`, `food_logs`, `workout_sessions`, `workout_exercises` |

## Design System

- Color palette and style variables are defined in `src/constants/theme.ts` and `src/global.css`.
- All pages use consistent backgrounds, accents, and text colors.
- The app logo and social login logos are stored in `src/assets/` and used throughout the UI.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
