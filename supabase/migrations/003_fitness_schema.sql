-- ============================================================
-- Migration 003: Fitness schema
-- - Extends profiles with all onboarding + fitness fields
-- - Auto-creates profile row on new user signup
-- - Creates body_measurements, food_logs, workout_sessions,
--   workout_exercises tables with RLS
-- ============================================================


-- ─── 1. Extend profiles with fitness columns ─────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age               integer        CONSTRAINT profiles_age_check        CHECK (age BETWEEN 10 AND 120),
  ADD COLUMN IF NOT EXISTS height_cm         numeric(5,1)   CONSTRAINT profiles_height_check      CHECK (height_cm > 0),
  ADD COLUMN IF NOT EXISTS weight_kg         numeric(5,1)   CONSTRAINT profiles_weight_check      CHECK (weight_kg > 0),
  ADD COLUMN IF NOT EXISTS target_weight_kg  numeric(5,1)   CONSTRAINT profiles_target_wt_check   CHECK (target_weight_kg > 0),
  ADD COLUMN IF NOT EXISTS gender            text           CONSTRAINT profiles_gender_check      CHECK (gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS fitness_goal      text           CONSTRAINT profiles_goal_check        CHECK (fitness_goal IN ('cut', 'maintain', 'bulk')),
  ADD COLUMN IF NOT EXISTS activity_level    text           CONSTRAINT profiles_activity_check    CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  ADD COLUMN IF NOT EXISTS unit_system       text           CONSTRAINT profiles_unit_system_check CHECK (unit_system IN ('metric', 'imperial')) DEFAULT 'metric',
  ADD COLUMN IF NOT EXISTS daily_calories    integer,
  ADD COLUMN IF NOT EXISTS daily_protein_g   integer,
  ADD COLUMN IF NOT EXISTS daily_carbs_g     integer,
  ADD COLUMN IF NOT EXISTS daily_fat_g       integer;


-- ─── 2. Auto-create a profile row when a user signs up ───────

create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── 3. body_measurements ─────────────────────────────────────
-- Tracks weight & body composition over time (for progress charts)

create table if not exists public.body_measurements (
  id             uuid         primary key default gen_random_uuid(),
  user_id        uuid         not null references auth.users(id) on delete cascade,
  measured_at    date         not null default current_date,
  weight_kg      numeric(5,1),
  body_fat_pct   numeric(4,1),
  notes          text,
  created_at     timestamptz  not null default now()
);

create index if not exists body_measurements_user_date_idx
  on public.body_measurements (user_id, measured_at desc);

alter table public.body_measurements enable row level security;
revoke all on table public.body_measurements from public, anon;
grant select, insert, update, delete on table public.body_measurements to authenticated;

drop policy if exists "body_measurements: owner" on public.body_measurements;
create policy "body_measurements: owner" on public.body_measurements
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ─── 4. food_logs ─────────────────────────────────────────────
-- Each row = one food item in a meal for a given day

create table if not exists public.food_logs (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  logged_at    date        not null default current_date,
  meal_type    text        not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name    text        not null,
  quantity     numeric(7,2) not null default 1,
  unit         text        not null default 'serving',
  calories     integer,
  protein_g    numeric(6,1),
  carbs_g      numeric(6,1),
  fat_g        numeric(6,1),
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists food_logs_user_date_idx
  on public.food_logs (user_id, logged_at desc);

alter table public.food_logs enable row level security;
revoke all on table public.food_logs from public, anon;
grant select, insert, update, delete on table public.food_logs to authenticated;

drop policy if exists "food_logs: owner" on public.food_logs;
create policy "food_logs: owner" on public.food_logs
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ─── 5. workout_sessions ─────────────────────────────────────
-- One row per workout session

create table if not exists public.workout_sessions (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  session_date     date        not null default current_date,
  name             text,
  notes            text,
  duration_minutes integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists workout_sessions_user_date_idx
  on public.workout_sessions (user_id, session_date desc);

drop trigger if exists workout_sessions_set_updated_at on public.workout_sessions;
create trigger workout_sessions_set_updated_at
  before update on public.workout_sessions
  for each row execute function public.set_updated_at();

alter table public.workout_sessions enable row level security;
revoke all on table public.workout_sessions from public, anon;
grant select, insert, update, delete on table public.workout_sessions to authenticated;

drop policy if exists "workout_sessions: owner" on public.workout_sessions;
create policy "workout_sessions: owner" on public.workout_sessions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ─── 6. workout_exercises ─────────────────────────────────────
-- Individual exercises within a session

create table if not exists public.workout_exercises (
  id                uuid       primary key default gen_random_uuid(),
  session_id        uuid       not null references public.workout_sessions(id) on delete cascade,
  exercise_name     text       not null,
  sort_order        integer    not null default 0,
  sets              integer,
  reps              integer,
  weight_kg         numeric(5,1),
  duration_seconds  integer,
  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists workout_exercises_session_idx
  on public.workout_exercises (session_id, sort_order);

alter table public.workout_exercises enable row level security;
revoke all on table public.workout_exercises from public, anon;
grant select, insert, update, delete on table public.workout_exercises to authenticated;

-- RLS via parent session ownership (no direct user_id needed)
drop policy if exists "workout_exercises: owner" on public.workout_exercises;
create policy "workout_exercises: owner" on public.workout_exercises
  for all
  using (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercises.session_id
        and ws.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_exercises.session_id
        and ws.user_id = auth.uid()
    )
  );


-- ─── End of migration ─────────────────────────────────────────