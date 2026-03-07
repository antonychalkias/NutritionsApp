-- Migration: create profiles table (if missing), enable RLS and add policies
-- Run this in the Supabase SQL editor or via your migration tooling.

-- 1) Create profiles table (app-specific metadata). Use auth.users(id) uuid as foreign key.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  phone text,
  locale text,
  timezone text,
  role text default 'user',                -- optional role field
  metadata jsonb,
  is_onboarded boolean not null default false,
  last_active timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- helper trigger to keep updated_at current
create or replace function public.set_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Postgres does not support CREATE TRIGGER IF NOT EXISTS, so drop first then create (idempotent)
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 2) Enable Row Level Security
alter table public.profiles enable row level security;

-- 3) Revoke default public privileges and grant explicitly to authenticated role
revoke all on table public.profiles from public, anon;
grant select, insert, update, delete on table public.profiles to authenticated;

-- 4) Policies: allow users to manage their own profile only
-- Note: auth.uid() returns the currently authenticated user's uuid in Supabase

-- drop if exists then create (IF NOT EXISTS not supported for CREATE POLICY on some Postgres versions)
drop policy if exists "Profiles: allow select for owner" on public.profiles;
create policy "Profiles: allow select for owner" on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Profiles: allow update for owner" on public.profiles;
create policy "Profiles: allow update for owner" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Profiles: allow insert for owner" on public.profiles;
create policy "Profiles: allow insert for owner" on public.profiles
  for insert
  with check (auth.uid() = id);

-- 5) Admin role policy example: allow service role or users with role='admin' to full access
-- Note: DO NOT expose the service_role key in clients. Use it only server-side.

drop policy if exists "Profiles: admins full access" on public.profiles;
create policy "Profiles: admins full access" on public.profiles
  for all
  using (
    -- allow if jwt has custom claim 'role' = 'admin'
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
  )
  with check (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
  );

-- 6) Example: secure a legacy custom_users table (if you have one).
-- If you maintain a custom users table, make sure RLS is enabled and password hashes are stored.
-- Replace `custom_users` with your table name if applicable.

-- alter table public.custom_users enable row level security;
-- revoke all on table public.custom_users from public;
-- create policy "custom_users: allow select for owner" on public.custom_users
--   for select using (auth.uid() = id::text); -- if id is uuid/text

-- 7) Notes for other public tables:
-- - For truly public read-only tables (e.g., list of countries) you can create a policy allowing select for role = 'anon' or 'public'.
-- - For user-specific tables (orders, posts, settings) create analogous policies using auth.uid() to match owner_id columns.

-- 8) Testing hints (run in Supabase SQL editor or from a server using anon key / authenticated key):
--  - As an anonymous user (no JWT) a select on public.profiles should return an error or empty.
--  - As an authenticated user, selecting your own profile (id = auth.uid()) should succeed.
--  - As an admin (role claim 'admin') full access should be allowed.

-- 9) Remember:
--  - Keep your service_role key secret and use server-side only.
--  - If you expose the anon key in clients, RLS policies must be strict.
--  - Add any redirect URLs used in auth flows to Supabase settings to avoid link errors.

-- End of migration

