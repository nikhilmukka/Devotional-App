-- Family Members Setup
-- Supports premium_family plan: one account owner can add multiple family profiles
-- Used for Kids & Family Learning and shared devotional routines

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  relation text not null default 'family',
  age_group text not null default 'adult',
  avatar_emoji text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint family_members_relation_check check (
    relation in ('spouse', 'child', 'parent', 'sibling', 'family')
  ),
  constraint family_members_age_group_check check (
    age_group in ('child', 'teen', 'adult')
  )
);

create index if not exists idx_family_members_owner
  on public.family_members (owner_user_id)
  where is_active = true;

drop trigger if exists set_family_members_updated_at on public.family_members;
create trigger set_family_members_updated_at
  before update on public.family_members
  for each row execute function public.handle_updated_at();

alter table public.family_members enable row level security;

drop policy if exists "family_members_select_own" on public.family_members;
create policy "family_members_select_own"
  on public.family_members for select
  using (owner_user_id = auth.uid());

drop policy if exists "family_members_insert_own" on public.family_members;
create policy "family_members_insert_own"
  on public.family_members for insert
  with check (owner_user_id = auth.uid());

drop policy if exists "family_members_update_own" on public.family_members;
create policy "family_members_update_own"
  on public.family_members for update
  using (owner_user_id = auth.uid());

drop policy if exists "family_members_delete_own" on public.family_members;
create policy "family_members_delete_own"
  on public.family_members for delete
  using (owner_user_id = auth.uid());
