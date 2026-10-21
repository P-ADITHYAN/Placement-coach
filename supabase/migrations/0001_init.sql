-- Placement Coach: initial schema (blueprint section 7).
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Security model: students can READ only their own rows. All writes go through
-- the app's server with the secret key, so scores can't be inserted or edited
-- from the browser.

-- Profiles ------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  target_role text,
  created_at timestamptz not null default now()
);

-- Create a profile automatically when someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Practice sessions -----------------------------------------------------------
create table public.gd_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  duration_minutes int not null check (duration_minutes between 1 and 30),
  ended_at timestamptz not null,
  overall_score int check (overall_score between 0 and 100),
  created_at timestamptz not null default now()
);

create index gd_sessions_user_created on public.gd_sessions (user_id, created_at desc);

create table public.gd_turns (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.gd_sessions (id) on delete cascade,
  turn_number int not null,
  speaker_type text not null check (speaker_type in ('student', 'ai')),
  persona_id text,
  transcript text not null,
  duration_seconds numeric not null default 0,
  unique (session_id, turn_number)
);

create table public.gd_reports (
  session_id uuid primary key references public.gd_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  overall_score int not null check (overall_score between 0 and 100),
  metrics jsonb not null,
  category_scores jsonb not null,
  strengths jsonb not null default '[]',
  priority_improvements jsonb not null default '[]',
  improved_example jsonb,
  practice_task text not null,
  rubric_version text not null,
  limited_evidence boolean not null default false,
  -- Model-cited quotes that failed verification (useful for assessment research).
  dropped_quotes int not null default 0,
  created_at timestamptz not null default now()
);

-- Row Level Security -----------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.gd_sessions enable row level security;
alter table public.gd_turns enable row level security;
alter table public.gd_reports enable row level security;

create policy "Read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "Read own sessions" on public.gd_sessions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Read own turns" on public.gd_turns
  for select to authenticated using (
    exists (
      select 1 from public.gd_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );

create policy "Read own reports" on public.gd_reports
  for select to authenticated using ((select auth.uid()) = user_id);
