create extension if not exists pgcrypto;

create type public.language_code as enum (
  'english',
  'hindi',
  'telugu',
  'kannada',
  'tamil',
  'marathi',
  'sanskrit'
);

create type public.script_code as enum (
  'native',
  'latin'
);

create type public.reminder_rule_type as enum (
  'daily',
  'festival'
);

create type public.device_platform as enum (
  'ios',
  'android',
  'web'
);

create type public.content_access_tier as enum (
  'free',
  'premium'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  contact_number text,
  avatar_url text,
  app_language public.language_code not null default 'english',
  prayer_source_language public.language_code not null default 'hindi',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notifications_enabled boolean not null default true,
  daily_reminder_enabled boolean not null default true,
  festival_reminder_enabled boolean not null default true,
  reminder_time_local time not null default '06:30',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.deities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  icon_name text,
  theme_start_color text,
  theme_end_color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.deity_translations (
  id uuid primary key default gen_random_uuid(),
  deity_id uuid not null references public.deities(id) on delete cascade,
  language public.language_code not null,
  name text not null,
  tagline text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (deity_id, language)
);

create table if not exists public.festivals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  symbol text,
  theme_start_color text,
  theme_end_color text,
  sort_order integer not null default 0,
  is_featured_home boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.festival_translations (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals(id) on delete cascade,
  language public.language_code not null,
  name text not null,
  native_name text,
  short_description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (festival_id, language)
);

create table if not exists public.festival_calendar (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals(id) on delete cascade,
  festival_date date not null,
  region_code text not null default 'global',
  calendar_system text not null default 'hindu_lunisolar',
  source_name text,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (festival_id, festival_date, region_code)
);

create table if not exists public.festival_pooja_guides (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals(id) on delete cascade,
  language public.language_code not null default 'english',
  title text not null,
  subtitle text,
  intro_text text,
  preparation_notes text,
  items_needed jsonb not null default '[]'::jsonb,
  step_by_step jsonb not null default '[]'::jsonb,
  linked_prayer_id uuid references public.prayers(id) on delete set null,
  access_tier public.content_access_tier not null default 'premium',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (festival_id, language)
);

create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  deity_id uuid references public.deities(id) on delete set null,
  category text not null,
  estimated_duration_seconds integer,
  verse_count integer,
  sort_order integer not null default 0,
  access_tier public.content_access_tier not null default 'free',
  is_featured_home boolean not null default false,
  is_audio_available boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prayer_texts (
  id uuid primary key default gen_random_uuid(),
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  language public.language_code not null,
  script public.script_code not null default 'native',
  title text not null,
  subtitle text,
  body_plain_text text,
  body_json jsonb not null default '[]'::jsonb,
  notes text,
  is_published boolean not null default true,
  search_vector tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(body_plain_text, '')
    )
  ) stored,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (prayer_id, language, script)
);

create index if not exists prayer_texts_search_vector_idx
  on public.prayer_texts
  using gin (search_vector);

create table if not exists public.prayer_audio_tracks (
  id uuid primary key default gen_random_uuid(),
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  language public.language_code not null,
  storage_path text not null,
  public_url text,
  duration_seconds integer,
  artist_name text,
  narrator_name text,
  access_tier public.content_access_tier not null default 'free',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prayer_festivals (
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  festival_id uuid not null references public.festivals(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (prayer_id, festival_id)
);

create table if not exists public.reminder_rules (
  id uuid primary key default gen_random_uuid(),
  rule_type public.reminder_rule_type not null,
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  festival_id uuid references public.festivals(id) on delete cascade,
  day_of_week smallint,
  send_time_local time not null default '06:30',
  region_code text not null default 'global',
  timezone_mode text not null default 'user_local',
  priority smallint not null default 100,
  start_date date,
  end_date date,
  is_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reminder_rules_shape_check check (
    (rule_type = 'daily' and day_of_week is not null and festival_id is null) or
    (rule_type = 'festival' and festival_id is not null)
  ),
  constraint reminder_rules_day_of_week_check check (
    day_of_week is null or day_of_week between 0 and 6
  )
);

create index if not exists reminder_rules_lookup_idx
  on public.reminder_rules (rule_type, day_of_week, festival_id, is_enabled, region_code);

create unique index if not exists reminder_rules_daily_unique_idx
  on public.reminder_rules (region_code, day_of_week)
  where rule_type = 'daily' and festival_id is null;

create unique index if not exists reminder_rules_festival_unique_idx
  on public.reminder_rules (region_code, festival_id)
  where rule_type = 'festival' and festival_id is not null;

create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, prayer_id)
);

create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform public.device_platform not null,
  expo_push_token text unique,
  device_name text,
  app_version text,
  last_seen_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id uuid references public.user_devices(id) on delete set null,
  reminder_rule_id uuid references public.reminder_rules(id) on delete set null,
  prayer_id uuid references public.prayers(id) on delete set null,
  festival_calendar_id uuid references public.festival_calendar(id) on delete set null,
  status text not null default 'queued',
  provider text not null default 'expo',
  response_payload jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists festival_calendar_date_idx
  on public.festival_calendar (festival_date, region_code, is_active);

create index if not exists festival_pooja_guides_lookup_idx
  on public.festival_pooja_guides (festival_id, language, is_published, sort_order);

create index if not exists prayers_featured_idx
  on public.prayers (is_featured_home, is_active, sort_order);

create index if not exists deities_active_idx
  on public.deities (is_active, sort_order);

create index if not exists festivals_featured_idx
  on public.festivals (is_featured_home, is_active, sort_order);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

drop trigger if exists set_deities_updated_at on public.deities;
create trigger set_deities_updated_at
before update on public.deities
for each row execute function public.set_updated_at();

drop trigger if exists set_deity_translations_updated_at on public.deity_translations;
create trigger set_deity_translations_updated_at
before update on public.deity_translations
for each row execute function public.set_updated_at();

drop trigger if exists set_festivals_updated_at on public.festivals;
create trigger set_festivals_updated_at
before update on public.festivals
for each row execute function public.set_updated_at();

drop trigger if exists set_festival_translations_updated_at on public.festival_translations;
create trigger set_festival_translations_updated_at
before update on public.festival_translations
for each row execute function public.set_updated_at();

drop trigger if exists set_festival_calendar_updated_at on public.festival_calendar;
create trigger set_festival_calendar_updated_at
before update on public.festival_calendar
for each row execute function public.set_updated_at();

drop trigger if exists set_festival_pooja_guides_updated_at on public.festival_pooja_guides;
create trigger set_festival_pooja_guides_updated_at
before update on public.festival_pooja_guides
for each row execute function public.set_updated_at();

drop trigger if exists set_prayers_updated_at on public.prayers;
create trigger set_prayers_updated_at
before update on public.prayers
for each row execute function public.set_updated_at();

drop trigger if exists set_prayer_texts_updated_at on public.prayer_texts;
create trigger set_prayer_texts_updated_at
before update on public.prayer_texts
for each row execute function public.set_updated_at();

drop trigger if exists set_prayer_audio_tracks_updated_at on public.prayer_audio_tracks;
create trigger set_prayer_audio_tracks_updated_at
before update on public.prayer_audio_tracks
for each row execute function public.set_updated_at();

drop trigger if exists set_reminder_rules_updated_at on public.reminder_rules;
create trigger set_reminder_rules_updated_at
before update on public.reminder_rules
for each row execute function public.set_updated_at();

drop trigger if exists set_user_devices_updated_at on public.user_devices;
create trigger set_user_devices_updated_at
before update on public.user_devices
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_favorites enable row level security;
alter table public.user_devices enable row level security;
alter table public.notification_logs enable row level security;

alter table public.deities enable row level security;
alter table public.deity_translations enable row level security;
alter table public.festivals enable row level security;
alter table public.festival_translations enable row level security;
alter table public.festival_calendar enable row level security;
alter table public.festival_pooja_guides enable row level security;
alter table public.prayers enable row level security;
alter table public.prayer_texts enable row level security;
alter table public.prayer_audio_tracks enable row level security;
alter table public.prayer_festivals enable row level security;
alter table public.reminder_rules enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "preferences_select_own" on public.user_preferences;
create policy "preferences_select_own"
on public.user_preferences
for select
using (auth.uid() = user_id);

drop policy if exists "preferences_insert_own" on public.user_preferences;
create policy "preferences_insert_own"
on public.user_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "preferences_update_own" on public.user_preferences;
create policy "preferences_update_own"
on public.user_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "favorites_select_own" on public.user_favorites;
create policy "favorites_select_own"
on public.user_favorites
for select
using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.user_favorites;
create policy "favorites_insert_own"
on public.user_favorites
for insert
with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.user_favorites;
create policy "favorites_delete_own"
on public.user_favorites
for delete
using (auth.uid() = user_id);

drop policy if exists "devices_select_own" on public.user_devices;
create policy "devices_select_own"
on public.user_devices
for select
using (auth.uid() = user_id);

drop policy if exists "devices_insert_own" on public.user_devices;
create policy "devices_insert_own"
on public.user_devices
for insert
with check (auth.uid() = user_id);

drop policy if exists "devices_update_own" on public.user_devices;
create policy "devices_update_own"
on public.user_devices
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notification_logs_select_own" on public.notification_logs;
create policy "notification_logs_select_own"
on public.notification_logs
for select
using (auth.uid() = user_id);

drop policy if exists "public_read_deities" on public.deities;
create policy "public_read_deities"
on public.deities
for select
using (is_active = true);

drop policy if exists "public_read_deity_translations" on public.deity_translations;
create policy "public_read_deity_translations"
on public.deity_translations
for select
using (true);

drop policy if exists "public_read_festivals" on public.festivals;
create policy "public_read_festivals"
on public.festivals
for select
using (is_active = true);

drop policy if exists "public_read_festival_translations" on public.festival_translations;
create policy "public_read_festival_translations"
on public.festival_translations
for select
using (true);

drop policy if exists "public_read_festival_calendar" on public.festival_calendar;
create policy "public_read_festival_calendar"
on public.festival_calendar
for select
using (is_active = true);

drop policy if exists "public_read_festival_pooja_guides" on public.festival_pooja_guides;
create policy "public_read_festival_pooja_guides"
on public.festival_pooja_guides
for select
using (is_published = true);

drop policy if exists "public_read_prayers" on public.prayers;
create policy "public_read_prayers"
on public.prayers
for select
using (is_active = true);

drop policy if exists "public_read_prayer_texts" on public.prayer_texts;
create policy "public_read_prayer_texts"
on public.prayer_texts
for select
using (is_published = true);

drop policy if exists "public_read_prayer_audio_tracks" on public.prayer_audio_tracks;
create policy "public_read_prayer_audio_tracks"
on public.prayer_audio_tracks
for select
using (is_active = true);

drop policy if exists "public_read_prayer_festivals" on public.prayer_festivals;
create policy "public_read_prayer_festivals"
on public.prayer_festivals
for select
using (true);

drop policy if exists "public_read_reminder_rules" on public.reminder_rules;
create policy "public_read_reminder_rules"
on public.reminder_rules
for select
using (is_enabled = true);
