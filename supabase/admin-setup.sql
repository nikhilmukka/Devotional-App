alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

insert into storage.buckets (id, name, public)
values ('prayer-audio', 'prayer-audio', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "admin_read_prayer_audio_objects" on storage.objects;
create policy "admin_read_prayer_audio_objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'prayer-audio'
  and public.is_admin_user()
);

drop policy if exists "admin_insert_prayer_audio_objects" on storage.objects;
create policy "admin_insert_prayer_audio_objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'prayer-audio'
  and public.is_admin_user()
);

drop policy if exists "admin_update_prayer_audio_objects" on storage.objects;
create policy "admin_update_prayer_audio_objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'prayer-audio'
  and public.is_admin_user()
)
with check (
  bucket_id = 'prayer-audio'
  and public.is_admin_user()
);

drop policy if exists "admin_delete_prayer_audio_objects" on storage.objects;
create policy "admin_delete_prayer_audio_objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'prayer-audio'
  and public.is_admin_user()
);

drop policy if exists "admin_insert_deities" on public.deities;
create policy "admin_insert_deities"
on public.deities
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_deities" on public.deities;
create policy "admin_update_deities"
on public.deities
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_deities" on public.deities;
create policy "admin_delete_deities"
on public.deities
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_deity_translations" on public.deity_translations;
create policy "admin_insert_deity_translations"
on public.deity_translations
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_deity_translations" on public.deity_translations;
create policy "admin_update_deity_translations"
on public.deity_translations
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_deity_translations" on public.deity_translations;
create policy "admin_delete_deity_translations"
on public.deity_translations
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_festivals" on public.festivals;
create policy "admin_insert_festivals"
on public.festivals
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_festivals" on public.festivals;
create policy "admin_update_festivals"
on public.festivals
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_festivals" on public.festivals;
create policy "admin_delete_festivals"
on public.festivals
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_festival_translations" on public.festival_translations;
create policy "admin_insert_festival_translations"
on public.festival_translations
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_festival_translations" on public.festival_translations;
create policy "admin_update_festival_translations"
on public.festival_translations
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_festival_translations" on public.festival_translations;
create policy "admin_delete_festival_translations"
on public.festival_translations
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_festival_calendar" on public.festival_calendar;
create policy "admin_insert_festival_calendar"
on public.festival_calendar
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_festival_calendar" on public.festival_calendar;
create policy "admin_update_festival_calendar"
on public.festival_calendar
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_festival_calendar" on public.festival_calendar;
create policy "admin_delete_festival_calendar"
on public.festival_calendar
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_festival_pooja_guides" on public.festival_pooja_guides;
create policy "admin_insert_festival_pooja_guides"
on public.festival_pooja_guides
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_festival_pooja_guides" on public.festival_pooja_guides;
create policy "admin_update_festival_pooja_guides"
on public.festival_pooja_guides
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_festival_pooja_guides" on public.festival_pooja_guides;
create policy "admin_delete_festival_pooja_guides"
on public.festival_pooja_guides
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_prayers" on public.prayers;
create policy "admin_insert_prayers"
on public.prayers
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_prayers" on public.prayers;
create policy "admin_update_prayers"
on public.prayers
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_prayers" on public.prayers;
create policy "admin_delete_prayers"
on public.prayers
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_prayer_texts" on public.prayer_texts;
create policy "admin_insert_prayer_texts"
on public.prayer_texts
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_prayer_texts" on public.prayer_texts;
create policy "admin_update_prayer_texts"
on public.prayer_texts
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_prayer_texts" on public.prayer_texts;
create policy "admin_delete_prayer_texts"
on public.prayer_texts
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_prayer_audio_tracks" on public.prayer_audio_tracks;
create policy "admin_insert_prayer_audio_tracks"
on public.prayer_audio_tracks
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_prayer_audio_tracks" on public.prayer_audio_tracks;
create policy "admin_update_prayer_audio_tracks"
on public.prayer_audio_tracks
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_prayer_audio_tracks" on public.prayer_audio_tracks;
create policy "admin_delete_prayer_audio_tracks"
on public.prayer_audio_tracks
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_prayer_festivals" on public.prayer_festivals;
create policy "admin_insert_prayer_festivals"
on public.prayer_festivals
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_prayer_festivals" on public.prayer_festivals;
create policy "admin_update_prayer_festivals"
on public.prayer_festivals
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_prayer_festivals" on public.prayer_festivals;
create policy "admin_delete_prayer_festivals"
on public.prayer_festivals
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists "admin_insert_reminder_rules" on public.reminder_rules;
create policy "admin_insert_reminder_rules"
on public.reminder_rules
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admin_update_reminder_rules" on public.reminder_rules;
create policy "admin_update_reminder_rules"
on public.reminder_rules
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_delete_reminder_rules" on public.reminder_rules;
create policy "admin_delete_reminder_rules"
on public.reminder_rules
for delete
to authenticated
using (public.is_admin_user());
