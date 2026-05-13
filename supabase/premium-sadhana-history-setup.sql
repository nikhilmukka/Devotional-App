create table if not exists public.user_sadhana_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_type text not null,
  session_date date not null,
  completed_at timestamptz not null default timezone('utc', now()),
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_sadhana_sessions_type_check check (
    session_type in ('daily_sadhana', 'family_learning')
  ),
  constraint user_sadhana_sessions_unique_day unique (user_id, session_type, session_date)
);

create index if not exists user_sadhana_sessions_recent_idx
  on public.user_sadhana_sessions (user_id, session_type, session_date desc);

drop trigger if exists set_user_sadhana_sessions_updated_at on public.user_sadhana_sessions;
create trigger set_user_sadhana_sessions_updated_at
before update on public.user_sadhana_sessions
for each row execute function public.set_updated_at();

alter table public.user_sadhana_sessions enable row level security;

drop policy if exists "sadhana_sessions_select_own" on public.user_sadhana_sessions;
create policy "sadhana_sessions_select_own"
on public.user_sadhana_sessions
for select
using (auth.uid() = user_id);

drop policy if exists "sadhana_sessions_insert_own" on public.user_sadhana_sessions;
create policy "sadhana_sessions_insert_own"
on public.user_sadhana_sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "sadhana_sessions_update_own" on public.user_sadhana_sessions;
create policy "sadhana_sessions_update_own"
on public.user_sadhana_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
