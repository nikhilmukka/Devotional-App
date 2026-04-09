create or replace function public.resolve_active_reminder(
  target_date date default current_date,
  target_region_code text default 'global'
)
returns table (
  reminder_rule_id uuid,
  rule_type public.reminder_rule_type,
  prayer_id uuid,
  festival_id uuid,
  festival_calendar_id uuid,
  matched_date date,
  send_time_local time,
  priority smallint
)
language sql
stable
as $$
  with active_festivals as (
    select
      fc.id as festival_calendar_id,
      fc.festival_id
    from public.festival_calendar fc
    where fc.festival_date = target_date
      and fc.is_active = true
      and fc.region_code = target_region_code
  ),
  festival_match as (
    select
      rr.id as reminder_rule_id,
      rr.rule_type,
      rr.prayer_id,
      rr.festival_id,
      af.festival_calendar_id,
      target_date as matched_date,
      rr.send_time_local,
      rr.priority
    from public.reminder_rules rr
    join active_festivals af on af.festival_id = rr.festival_id
    where rr.rule_type = 'festival'
      and rr.is_enabled = true
      and rr.region_code = target_region_code
      and (rr.start_date is null or rr.start_date <= target_date)
      and (rr.end_date is null or rr.end_date >= target_date)
    order by rr.priority asc, rr.updated_at desc
    limit 1
  ),
  daily_match as (
    select
      rr.id as reminder_rule_id,
      rr.rule_type,
      rr.prayer_id,
      rr.festival_id,
      null::uuid as festival_calendar_id,
      target_date as matched_date,
      rr.send_time_local,
      rr.priority
    from public.reminder_rules rr
    where rr.rule_type = 'daily'
      and rr.is_enabled = true
      and rr.region_code = target_region_code
      and rr.day_of_week = extract(dow from target_date)::smallint
      and (rr.start_date is null or rr.start_date <= target_date)
      and (rr.end_date is null or rr.end_date >= target_date)
    order by rr.priority asc, rr.updated_at desc
    limit 1
  )
  select * from festival_match
  union all
  select * from daily_match
  where not exists (select 1 from festival_match)
  limit 1;
$$;

grant execute on function public.resolve_active_reminder(date, text) to anon, authenticated;
