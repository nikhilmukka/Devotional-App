create table if not exists public.user_private_shlokas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_language public.language_code not null default 'hindi',
  script public.script_code not null default 'native',
  body_plain_text text not null,
  notes text,
  sort_order integer not null default 0,
  is_pinned boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_private_shlokas
  add column if not exists recording_storage_path text,
  add column if not exists recording_duration_seconds integer,
  add column if not exists recording_uploaded_at timestamptz;

create index if not exists idx_user_private_shlokas_user
  on public.user_private_shlokas (user_id, is_pinned desc, sort_order asc, updated_at desc);

drop trigger if exists set_user_private_shlokas_updated_at on public.user_private_shlokas;
create trigger set_user_private_shlokas_updated_at
before update on public.user_private_shlokas
for each row execute function public.set_updated_at();

alter table public.user_private_shlokas enable row level security;

drop policy if exists "private_shlokas_select_own" on public.user_private_shlokas;
create policy "private_shlokas_select_own"
on public.user_private_shlokas
for select
using (auth.uid() = user_id);

drop policy if exists "private_shlokas_insert_own" on public.user_private_shlokas;
create policy "private_shlokas_insert_own"
on public.user_private_shlokas
for insert
with check (auth.uid() = user_id);

drop policy if exists "private_shlokas_update_own" on public.user_private_shlokas;
create policy "private_shlokas_update_own"
on public.user_private_shlokas
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "private_shlokas_delete_own" on public.user_private_shlokas;
create policy "private_shlokas_delete_own"
on public.user_private_shlokas
for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('user-recitations', 'user-recitations', false)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "user_recitations_select_own" on storage.objects;
create policy "user_recitations_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-recitations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "user_recitations_insert_own" on storage.objects;
create policy "user_recitations_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-recitations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "user_recitations_update_own" on storage.objects;
create policy "user_recitations_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-recitations'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'user-recitations'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "user_recitations_delete_own" on storage.objects;
create policy "user_recitations_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-recitations'
  and auth.uid()::text = (storage.foldername(name))[1]
);
