# NutritionsApp

This is a custom React Native (Expo + TypeScript) application. The default entry point is now `src/app/index.tsx`.

## Pages

Each page has its own folder and component under `src/pages`.

### /loading — Loading (src/pages/Loading)
**What the user sees:**
- The app logo (spartan-macro) and a loading bar are displayed while the application initializes.
- This page provides a smooth transition into the app and reassures the user that the app is starting up.
- Uses the color palette for a greenish background.

### /auth — Auth (src/pages/Auth)
**What the user sees:**
- A login/registration form with a modern "bricks" UI: each input, button, and social option is a visually distinct card/brick.
- Users can switch between login and registration modes, with clear buttons and consistent styles.
- Registration form includes name, email, password, confirm password, and social registration options (Google, Apple).
- Social login buttons show only the official trademark logos for Google and Apple, no text.
- All inputs use the reusable AppInput component, supporting three sizes: small, large, xl.
- The color palette and design system are applied for backgrounds, accents, and text.

### /error — Error (src/pages/Error)
**What the user sees:**
- A simple error page shown when no internet connection is detected on startup.
- Shows the app logo, a short message, and a Retry button which brings the user back to the Loading screen to re-run connectivity checks.

### /onboarding — Onboarding (src/pages/Onboarding)
**What the user sees:**
- 4-step onboarding wizard (profile, body, goal, activity).

## Entry Point

The application starts from `src/app/index.tsx`, which renders the Loading page initially, then the Auth page.

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

- `src/app/index.tsx` — Application entry point
- `src/pages/Loading` — Loading screen component
- `src/pages/Error` — Error screen shown when no internet connection is available
- `src/pages/Auth` — Login/registration screen component
- `src/pages/Onboarding` — 4-step onboarding wizard (profile, body, goal, activity)
- `src/components/AppInput.tsx` — Reusable input component with size support
- `src/constants/theme.ts` — Centralized color palette and design system
- `src/assets/` — Assets folder (logos, icons)
- `src/global.css` — Global styles

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
