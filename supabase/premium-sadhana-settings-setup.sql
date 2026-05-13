alter table public.user_preferences
add column if not exists daily_sadhana_enabled boolean not null default false;

alter table public.user_preferences
add column if not exists daily_sadhana_duration_minutes integer not null default 15;

alter table public.user_preferences
add column if not exists daily_sadhana_focus text not null default 'balanced';

alter table public.user_preferences
add column if not exists daily_sadhana_preferred_deity text;

alter table public.user_preferences
drop constraint if exists user_preferences_daily_sadhana_duration_check;

alter table public.user_preferences
add constraint user_preferences_daily_sadhana_duration_check
check (daily_sadhana_duration_minutes between 10 and 20);

alter table public.user_preferences
drop constraint if exists user_preferences_daily_sadhana_focus_check;

alter table public.user_preferences
add constraint user_preferences_daily_sadhana_focus_check
check (daily_sadhana_focus in ('balanced', 'calm', 'strength', 'prosperity', 'devotion'));
