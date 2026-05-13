alter table public.user_preferences
add column if not exists family_learning_enabled boolean not null default false;

alter table public.user_preferences
add column if not exists family_learning_age_group text not null default 'family';

alter table public.user_preferences
add column if not exists family_learning_mode text not null default 'meaning';

alter table public.user_preferences
add column if not exists family_learning_preferred_deity text;

alter table public.user_preferences
drop constraint if exists user_preferences_family_learning_age_group_check;

alter table public.user_preferences
add constraint user_preferences_family_learning_age_group_check
check (family_learning_age_group in ('4-6', '7-10', '11-14', 'family'));

alter table public.user_preferences
drop constraint if exists user_preferences_family_learning_mode_check;

alter table public.user_preferences
add constraint user_preferences_family_learning_mode_check
check (family_learning_mode in ('meaning', 'repeat', 'story', 'chant'));
