create table if not exists public.notification_dispatch_jobs (
  id uuid primary key default gen_random_uuid(),
  dispatch_key text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.user_devices(id) on delete set null,
  reminder_rule_id uuid references public.reminder_rules(id) on delete set null,
  prayer_id uuid references public.prayers(id) on delete set null,
  festival_calendar_id uuid references public.festival_calendar(id) on delete set null,
  target_date date not null,
  scheduled_for_local timestamp without time zone not null,
  region_code text not null default 'global',
  job_status text not null default 'queued',
  provider text not null default 'expo_dispatch',
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  next_attempt_at timestamptz default timezone('utc', now()),
  last_error text,
  last_attempt_at timestamptz,
  sent_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notification_dispatch_jobs_status_check check (
    job_status in ('queued', 'processing', 'sent', 'failed', 'canceled', 'skipped')
  )
);

alter table public.notification_dispatch_jobs
  add column if not exists max_attempts integer not null default 3;

alter table public.notification_dispatch_jobs
  add column if not exists next_attempt_at timestamptz not null default timezone('utc', now());

alter table public.notification_dispatch_jobs
  alter column next_attempt_at drop not null;

alter table public.user_preferences
  add column if not exists festival_preparation_reminder_enabled boolean not null default false;

alter table public.user_preferences
  add column if not exists festival_preparation_lead_days integer not null default 1;

alter table public.user_preferences
  drop constraint if exists user_preferences_festival_preparation_lead_days_check;

alter table public.user_preferences
  add constraint user_preferences_festival_preparation_lead_days_check
  check (festival_preparation_lead_days between 1 and 2);

create index if not exists notification_dispatch_jobs_recent_user_idx
  on public.notification_dispatch_jobs (user_id, created_at desc);

create index if not exists notification_dispatch_jobs_status_idx
  on public.notification_dispatch_jobs (job_status, target_date, region_code);

create index if not exists notification_dispatch_jobs_next_attempt_idx
  on public.notification_dispatch_jobs (job_status, next_attempt_at, created_at);

alter table public.notification_dispatch_jobs enable row level security;

drop policy if exists "notification_dispatch_jobs_select_own" on public.notification_dispatch_jobs;
create policy "notification_dispatch_jobs_select_own"
on public.notification_dispatch_jobs
for select
using (auth.uid() = user_id);

alter table public.notification_logs
  add column if not exists dispatch_job_id uuid references public.notification_dispatch_jobs(id) on delete set null;

drop trigger if exists set_notification_dispatch_jobs_updated_at on public.notification_dispatch_jobs;
create trigger set_notification_dispatch_jobs_updated_at
before update on public.notification_dispatch_jobs
for each row execute function public.set_updated_at();

create or replace function public.queue_my_due_notification_jobs(
  target_date date default current_date,
  target_region_code text default 'global'
)
returns table (
  job_id uuid,
  device_id uuid,
  job_status text,
  scheduled_for_local timestamp without time zone,
  prayer_slug text,
  reminder_type public.reminder_rule_type,
  reminder_variant text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    return;
  end if;

  return query
  with prefs as (
    select up.*
    from public.user_preferences up
    where up.user_id = current_user_id
      and up.notifications_enabled = true
  ),
  resolved as (
    select rr.*
    from public.resolve_active_reminder(target_date, target_region_code) rr
  ),
  eligible as (
    select
      current_user_id as user_id,
      ud.id as device_id,
      rr.reminder_rule_id,
      rr.rule_type,
      rr.prayer_id,
      rr.festival_id,
      rr.festival_calendar_id,
      rr.matched_date,
      p.reminder_time_local,
      prayer.slug as prayer_slug,
      concat(
        current_user_id::text,
        ':',
        ud.id::text,
        ':',
        rr.reminder_rule_id::text,
        ':',
        coalesce(rr.festival_calendar_id::text, 'daily'),
        ':',
        rr.matched_date::text
      ) as dispatch_key,
      jsonb_build_object(
        'prayer_slug', prayer.slug,
        'reminder_type', rr.rule_type,
        'reminder_variant', 'standard',
        'target_date', rr.matched_date,
        'region_code', target_region_code
      ) as payload
    from prefs p
    join public.user_devices ud
      on ud.user_id = current_user_id
     and ud.is_active = true
     and ud.expo_push_token is not null
    join resolved rr
      on (
        (rr.rule_type = 'daily' and p.daily_reminder_enabled = true)
        or (rr.rule_type = 'festival' and p.festival_reminder_enabled = true)
      )
    join public.prayers prayer
      on prayer.id = rr.prayer_id
  ),
  premium_entitlement as (
    select
      ue.user_id,
      (
        ue.subscription_tier <> 'free'
        and (
          ue.is_lifetime = true
          or ue.entitlement_status in ('active', 'trial', 'grace_period')
          or (
            ue.entitlement_status = 'canceled'
            and ue.valid_until is not null
            and ue.valid_until > timezone('utc', now())
          )
        )
      ) as has_premium_access
    from public.user_entitlements ue
    where ue.user_id = current_user_id
  ),
  preparation_eligible as (
    select
      current_user_id as user_id,
      ud.id as device_id,
      rr.id as reminder_rule_id,
      rr.rule_type,
      rr.prayer_id,
      rr.festival_id,
      fc.id as festival_calendar_id,
      target_date as matched_date,
      p.reminder_time_local,
      prayer.slug as prayer_slug,
      concat(
        current_user_id::text,
        ':',
        ud.id::text,
        ':',
        rr.id::text,
        ':prep:',
        fc.id::text,
        ':',
        target_date::text
      ) as dispatch_key,
      jsonb_build_object(
        'prayer_slug', prayer.slug,
        'reminder_type', rr.rule_type,
        'reminder_variant', 'festival_preparation',
        'festival_slug', festival.slug,
        'festival_date', fc.festival_date,
        'days_ahead', p.festival_preparation_lead_days,
        'target_date', target_date,
        'region_code', target_region_code
      ) as payload
    from prefs p
    join premium_entitlement pe
      on pe.user_id = current_user_id
     and pe.has_premium_access = true
    join public.user_devices ud
      on ud.user_id = current_user_id
     and ud.is_active = true
     and ud.expo_push_token is not null
    join public.festival_calendar fc
      on fc.festival_date = target_date + p.festival_preparation_lead_days
     and fc.is_active = true
     and fc.region_code = target_region_code
    join public.reminder_rules rr
      on rr.rule_type = 'festival'
     and rr.festival_id = fc.festival_id
     and rr.is_enabled = true
     and rr.region_code = target_region_code
     and (rr.start_date is null or rr.start_date <= fc.festival_date)
     and (rr.end_date is null or rr.end_date >= fc.festival_date)
    join public.prayers prayer
      on prayer.id = rr.prayer_id
    join public.festivals festival
      on festival.id = fc.festival_id
    where p.festival_preparation_reminder_enabled = true
  ),
  combined as (
    select * from eligible
    union all
    select * from preparation_eligible
  ),
  upserted as (
    insert into public.notification_dispatch_jobs (
      dispatch_key,
      user_id,
      device_id,
      reminder_rule_id,
      prayer_id,
      festival_calendar_id,
      target_date,
      scheduled_for_local,
      region_code,
      job_status,
      provider,
      max_attempts,
      next_attempt_at,
      payload
    )
    select
      combined.dispatch_key,
      combined.user_id,
      combined.device_id,
      combined.reminder_rule_id,
      combined.prayer_id,
      combined.festival_calendar_id,
      combined.matched_date,
      combined.matched_date::timestamp + combined.reminder_time_local,
      target_region_code,
      'queued',
      'expo_dispatch',
      3,
      timezone('utc', now()),
      combined.payload
    from combined
    on conflict (dispatch_key)
    do update set
      scheduled_for_local = excluded.scheduled_for_local,
      region_code = excluded.region_code,
      payload = excluded.payload,
      max_attempts = excluded.max_attempts,
      next_attempt_at = case
        when public.notification_dispatch_jobs.job_status = 'sent'
          then public.notification_dispatch_jobs.next_attempt_at
        else timezone('utc', now())
      end,
      updated_at = timezone('utc', now()),
      last_error = null,
      job_status = case
        when public.notification_dispatch_jobs.job_status in ('sent', 'processing')
          then public.notification_dispatch_jobs.job_status
        else 'queued'
      end
    returning
      public.notification_dispatch_jobs.id,
      public.notification_dispatch_jobs.device_id,
      public.notification_dispatch_jobs.job_status,
      public.notification_dispatch_jobs.scheduled_for_local,
      public.notification_dispatch_jobs.payload,
      public.notification_dispatch_jobs.prayer_id,
      public.notification_dispatch_jobs.reminder_rule_id
  )
  select
    upserted.id as job_id,
    upserted.device_id,
    upserted.job_status,
    upserted.scheduled_for_local,
    prayer.slug as prayer_slug,
    rr.rule_type as reminder_type,
    coalesce(upserted.payload->>'reminder_variant', 'standard') as reminder_variant
  from upserted
  left join public.prayers prayer
    on prayer.id = upserted.prayer_id
  left join public.reminder_rules rr
    on rr.id = upserted.reminder_rule_id
  order by upserted.scheduled_for_local asc, upserted.id asc;
end;
$$;

grant execute on function public.queue_my_due_notification_jobs(date, text) to authenticated;

create or replace function public.compute_notification_dispatch_retry_at(
  p_attempt_count integer
)
returns timestamptz
language plpgsql
stable
as $$
begin
  return timezone('utc', now()) + case
    when coalesce(p_attempt_count, 0) <= 1 then interval '5 minutes'
    when p_attempt_count = 2 then interval '15 minutes'
    when p_attempt_count = 3 then interval '1 hour'
    else interval '3 hours'
  end;
end;
$$;

create or replace function public.claim_due_notification_dispatch_jobs(
  target_region_code text default null,
  max_jobs integer default 25
)
returns table (
  job_id uuid,
  user_id uuid,
  device_id uuid,
  expo_push_token text,
  prayer_slug text,
  reminder_type public.reminder_rule_type,
  target_date date,
  scheduled_for_local timestamp without time zone,
  payload jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select ndj.id
    from public.notification_dispatch_jobs ndj
    join public.user_devices ud
      on ud.id = ndj.device_id
     and ud.is_active = true
     and ud.expo_push_token is not null
    where ndj.job_status = 'queued'
      and ndj.provider = 'expo_dispatch'
      and (target_region_code is null or ndj.region_code = target_region_code)
      and ndj.target_date <= current_date
      and coalesce(ndj.next_attempt_at, timezone('utc', now())) <= timezone('utc', now())
    order by ndj.created_at asc, ndj.id asc
    limit greatest(coalesce(max_jobs, 25), 1)
    for update of ndj skip locked
  ),
  claimed as (
    update public.notification_dispatch_jobs ndj
    set
      job_status = 'processing',
      attempt_count = ndj.attempt_count + 1,
      last_attempt_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
    from candidates
    where ndj.id = candidates.id
    returning
      ndj.id,
      ndj.user_id,
      ndj.device_id,
      ndj.prayer_id,
      ndj.reminder_rule_id,
      ndj.target_date,
      ndj.scheduled_for_local,
      ndj.payload
  )
  select
    claimed.id as job_id,
    claimed.user_id,
    claimed.device_id,
    ud.expo_push_token,
    prayer.slug as prayer_slug,
    rr.rule_type as reminder_type,
    claimed.target_date,
    claimed.scheduled_for_local,
    claimed.payload
  from claimed
  join public.user_devices ud
    on ud.id = claimed.device_id
  left join public.prayers prayer
    on prayer.id = claimed.prayer_id
  left join public.reminder_rules rr
    on rr.id = claimed.reminder_rule_id
  order by claimed.scheduled_for_local asc, claimed.id asc;
end;
$$;

create or replace function public.complete_notification_dispatch_job(
  p_job_id uuid,
  p_job_status text,
  p_response_payload jsonb default '{}'::jsonb,
  p_last_error text default null,
  p_sent_at timestamptz default timezone('utc', now())
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  target_job public.notification_dispatch_jobs%rowtype;
  normalized_status text := lower(coalesce(p_job_status, 'failed'));
  final_status text;
  next_retry_at timestamptz;
begin
  if normalized_status not in ('sent', 'failed', 'skipped', 'canceled') then
    raise exception 'Unsupported notification dispatch status: %', p_job_status;
  end if;

  select *
  into target_job
  from public.notification_dispatch_jobs
  where id = p_job_id;

  if not found then
    return 'missing';
  end if;

  if normalized_status = 'failed' and target_job.attempt_count < target_job.max_attempts then
    final_status := 'queued';
    next_retry_at := public.compute_notification_dispatch_retry_at(target_job.attempt_count);
  else
    final_status := normalized_status;
    next_retry_at := null;
  end if;

  update public.notification_dispatch_jobs
  set
    job_status = final_status,
    last_error = case when final_status = 'sent' then null else p_last_error end,
    sent_at = case when final_status = 'sent' then coalesce(p_sent_at, timezone('utc', now())) else sent_at end,
    next_attempt_at = case
      when final_status = 'queued' then next_retry_at
      when final_status = 'sent' then null
      when final_status in ('failed', 'canceled', 'skipped') then null
      else next_attempt_at
    end,
    updated_at = timezone('utc', now())
  where id = p_job_id;

  insert into public.notification_logs (
    user_id,
    dispatch_job_id,
    device_id,
    reminder_rule_id,
    prayer_id,
    festival_calendar_id,
    status,
    provider,
    response_payload,
    sent_at
  )
  values (
    target_job.user_id,
    target_job.id,
    target_job.device_id,
    target_job.reminder_rule_id,
    target_job.prayer_id,
    target_job.festival_calendar_id,
    normalized_status,
    target_job.provider,
    p_response_payload,
    case when normalized_status = 'sent' then coalesce(p_sent_at, timezone('utc', now())) else null end
  );

  return final_status;
end;
$$;

create or replace function public.cleanup_terminal_notification_dispatch_jobs(
  p_keep_sent_days integer default 14,
  p_keep_failed_days integer default 30
)
returns table (
  deleted_sent integer,
  deleted_failed integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  sent_count integer := 0;
  failed_count integer := 0;
begin
  with deleted as (
    delete from public.notification_dispatch_jobs
    where job_status in ('sent', 'canceled', 'skipped')
      and updated_at < timezone('utc', now()) - make_interval(days => greatest(coalesce(p_keep_sent_days, 14), 1))
    returning 1
  )
  select count(*) into sent_count from deleted;

  with deleted as (
    delete from public.notification_dispatch_jobs
    where job_status = 'failed'
      and updated_at < timezone('utc', now()) - make_interval(days => greatest(coalesce(p_keep_failed_days, 30), 1))
    returning 1
  )
  select count(*) into failed_count from deleted;

  return query select sent_count, failed_count;
end;
$$;

grant execute on function public.claim_due_notification_dispatch_jobs(text, integer) to service_role;
grant execute on function public.complete_notification_dispatch_job(uuid, text, jsonb, text, timestamptz) to service_role;
grant execute on function public.cleanup_terminal_notification_dispatch_jobs(integer, integer) to service_role;
