Auth page: testing and RLS guidance

This short document explains how to test email verification and OAuth redirect flows locally and the recommended minimal RLS setup for your `profiles` table.

Testing verification links locally

1) Expo proxy (recommended for development)
   - Use `AuthSession.makeRedirectUri({ useProxy: true })` when triggering OAuth/signUp flows.
   - Add the Expo proxy URL to Supabase Auth redirect URLs: `https://auth.expo.io/@your-username/your-app-slug`.

2) LAN IP (fast, no tunnel)
   - Find your machine IP (macOS): `ipconfig getifaddr en0`.
   - Start your dev server on 0.0.0.0 so the phone can reach it.
   - Add `http://<your-ip>:3000` to Supabase redirect URLs.

3) ngrok (works across networks)
   - Install: `npm i -g ngrok`
   - Run: `ngrok http 3000`
   - Add the public https URL to Supabase redirect URLs.

Row Level Security (RLS) basics for `profiles`

- We recommend keeping Supabase Auth as the canonical auth provider and creating a `profiles` table that references `auth.users(id)` (uuid).
- RLS must be enabled for tables containing user-owned data. Use policies that compare `auth.uid()` to the owner column.
- A supplied migration `supabase/migrations/001_enable_rls_profiles.sql` creates the `profiles` table and example policies.

Security reminders

- Never embed the Supabase service_role key in client apps. Use it only server-side.
- Keep your SMTP and provider client secrets secure.
- If your old `users` table stores plaintext passwords, migrate users via password reset flows; do not migrate plaintext passwords.

If you want, I can add a small test page that prints `window.location.hash` so clicking email links opens a readable page on your phone.
