-- Migration: secure existing public.users table
-- This migration is idempotent and will only run its changes if the table public.users exists.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN

    -- 1) Add auth_uid column to map Supabase auth user UUIDs
    ALTER TABLE IF EXISTS public.users
      ADD COLUMN IF NOT EXISTS auth_uid uuid;

    -- 2) Try to map existing rows by email (if emails match between tables)
    -- Note: this updates auth_uid where the email matches auth.users.email (case-insensitive)
    UPDATE public.users u
    SET auth_uid = a.id
    FROM auth.users a
    WHERE lower(a.email) = lower(u.email)
      AND u.auth_uid IS NULL;

    -- 3) (Optional) If you want to enforce that every row has an auth_uid in future, add a constraint
    -- ALTER TABLE public.users ADD CONSTRAINT users_auth_uid_unique UNIQUE (auth_uid);

    -- 4) Enable Row Level Security
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    -- 5) Revoke default public privileges (recommended)
    REVOKE ALL ON TABLE public.users FROM public;

    -- 6) Policies: allow users to select/update their own record based on auth_uid
    -- drop then create to be idempotent
    DROP POLICY IF EXISTS "Users: allow select for owner" ON public.users;
    CREATE POLICY "Users: allow select for owner" ON public.users
      FOR SELECT
      USING (auth.uid()::text = auth_uid::text);

    DROP POLICY IF EXISTS "Users: allow update for owner" ON public.users;
    CREATE POLICY "Users: allow update for owner" ON public.users
      FOR UPDATE
      USING (auth.uid()::text = auth_uid::text)
      WITH CHECK (auth.uid()::text = auth_uid::text);

    -- 7) Policy: allow inserts only by admin role (via JWT claim) or service role server calls
    DROP POLICY IF EXISTS "Users: allow insert for admins" ON public.users;
    CREATE POLICY "Users: allow insert for admins" ON public.users
      FOR INSERT
      WITH CHECK (
        (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
      );

    -- 8) Admins policy: allow full access to admin users (role claim = 'admin')
    DROP POLICY IF EXISTS "Users: admins full access" ON public.users;
    CREATE POLICY "Users: admins full access" ON public.users
      FOR ALL
      USING (
        (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
      )
      WITH CHECK (
        (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
      );

    -- 9) Helpful index on email for lookup
    CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (lower(email));

  END IF;
END$$;

-- NOTES:
-- - RLS policies use auth.uid() which returns the JWT-subject (a uuid for auth.users).
-- - If auth_uid is null for some legacy rows, those rows will be inaccessible to regular users
--   until you map them to an auth user (or assign admin access to update them).
-- - Do NOT expose the service_role key in client apps; use server-side functions for any admin-only writes.
-- - After running this migration, test as an anonymous user and as an authenticated user to verify policies.

-- End of migration

