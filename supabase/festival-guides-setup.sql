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

create index if not exists festival_pooja_guides_lookup_idx
  on public.festival_pooja_guides (festival_id, language, is_published, sort_order);

drop trigger if exists set_festival_pooja_guides_updated_at on public.festival_pooja_guides;
create trigger set_festival_pooja_guides_updated_at
before update on public.festival_pooja_guides
for each row execute function public.set_updated_at();

alter table public.festival_pooja_guides enable row level security;

drop policy if exists "public_read_festival_pooja_guides" on public.festival_pooja_guides;
create policy "public_read_festival_pooja_guides"
on public.festival_pooja_guides
for select
using (is_published = true);
