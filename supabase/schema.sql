-- 1. Profiles (Public User Data)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Tasks (Core Data)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text default 'todo', -- 'todo', 'in-progress', 'done'
  priority text default 'normal', -- 'low', 'normal', 'high'
  energy_level text default 'medium', -- 'low', 'medium', 'high'
  estimated_pomodoros int default 1,
  completed_pomodoros int default 0,
  project_id text default 'default',
  created_at bigint, -- Timestamp as number for compatibility
  due_date timestamptz,
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Users can manage their own tasks."
  on tasks for all
  using ( auth.uid() = user_id );

-- 3. Projects
create table if not exists public.projects (
  id text primary key, -- UUID string from frontend
  user_id uuid references auth.users not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Users can manage their own projects."
  on projects for all
  using ( auth.uid() = user_id );

-- 4. Pomodoro Sessions (Analytics)
create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  start_time bigint,
  duration int, -- minutes
  mode text, -- 'pomodoro', 'shortBreak', 'longBreak'
  completed boolean default false,
  project_id text,
  task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.pomodoro_sessions enable row level security;

create policy "Users can manage their own sessions."
  on pomodoro_sessions for all
  using ( auth.uid() = user_id );

-- 5. User Settings (JSON Blob for flexibility)
create table if not exists public.user_settings (
  user_id uuid references auth.users not null primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.user_settings enable row level security;

create policy "Users can manage their own settings."
  on user_settings for all
  using ( auth.uid() = user_id );

-- 6. User Stats (Aggregated Data)
create table if not exists public.user_stats_data (
  user_id uuid references auth.users not null primary key,
  stats_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.user_stats_data enable row level security;

create policy "Users can manage their own stats."
  on user_stats_data for all
  using ( auth.uid() = user_id );

-- 7. Triggers: Auto-create Profile and Settings on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_settings (user_id, settings)
  values (new.id, '{"pomodoroDuration": 25, "shortBreakDuration": 5, "longBreakDuration": 15}'::jsonb);

  insert into public.user_stats_data (user_id, stats_data)
  values (new.id, '{}'::jsonb);
  
  return new;
end;
$$;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
