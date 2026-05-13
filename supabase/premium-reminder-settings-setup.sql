alter table public.user_preferences
  add column if not exists festival_preparation_reminder_enabled boolean not null default false;

alter table public.user_preferences
  add column if not exists festival_preparation_lead_days integer not null default 1;

alter table public.user_preferences
  drop constraint if exists user_preferences_festival_preparation_lead_days_check;

alter table public.user_preferences
  add constraint user_preferences_festival_preparation_lead_days_check
  check (festival_preparation_lead_days between 1 and 2);
