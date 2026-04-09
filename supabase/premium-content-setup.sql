do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'content_access_tier'
  ) then
    create type public.content_access_tier as enum ('free', 'premium');
  end if;
end $$;

alter table public.prayers
  add column if not exists access_tier public.content_access_tier not null default 'free';

alter table public.prayer_audio_tracks
  add column if not exists access_tier public.content_access_tier not null default 'free';
