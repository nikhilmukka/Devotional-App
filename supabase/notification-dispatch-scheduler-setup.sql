create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.invoke_dispatch_reminder_notifications(
  p_max_jobs integer default 25,
  p_region_code text default 'global'
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  project_url text;
  bearer_token text;
  request_id bigint;
begin
  select decrypted_secret
  into project_url
  from vault.decrypted_secrets
  where name = 'project_url'
  order by created_at desc
  limit 1;

  select decrypted_secret
  into bearer_token
  from vault.decrypted_secrets
  where name = 'reminder_dispatch_bearer_token'
  order by created_at desc
  limit 1;

  if project_url is null or length(trim(project_url)) = 0 then
    raise exception 'Vault secret "project_url" is missing. Add your Supabase project URL before scheduling reminder dispatch.';
  end if;

  if bearer_token is null or length(trim(bearer_token)) = 0 then
    raise exception 'Vault secret "reminder_dispatch_bearer_token" is missing. Add a valid Edge Function bearer token before scheduling reminder dispatch.';
  end if;

  select net.http_post(
    url := trim(trailing '/' from project_url) || '/functions/v1/dispatch-reminder-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || bearer_token
    ),
    body := jsonb_build_object(
      'maxJobs', greatest(1, least(coalesce(p_max_jobs, 25), 100)),
      'regionCode', coalesce(p_region_code, 'global')
    )
  )
  into request_id;

  return request_id;
end;
$$;

create or replace function public.enable_dispatch_reminder_schedule(
  p_schedule_name text default 'dispatch-reminder-notifications-every-5-minutes',
  p_cron_expression text default '*/5 * * * *',
  p_max_jobs integer default 25,
  p_region_code text default 'global'
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_job_id bigint;
  new_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = p_schedule_name
  order by jobid desc
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  select cron.schedule(
    p_schedule_name,
    p_cron_expression,
    format(
      $job$
        select public.invoke_dispatch_reminder_notifications(%s, %L);
      $job$,
      greatest(1, least(coalesce(p_max_jobs, 25), 100)),
      coalesce(p_region_code, 'global')
    )
  )
  into new_job_id;

  return new_job_id;
end;
$$;

create or replace function public.disable_dispatch_reminder_schedule(
  p_schedule_name text default 'dispatch-reminder-notifications-every-5-minutes'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = p_schedule_name
  order by jobid desc
  limit 1;

  if existing_job_id is null then
    return false;
  end if;

  perform cron.unschedule(existing_job_id);
  return true;
end;
$$;

create or replace function public.enable_notification_dispatch_cleanup_schedule(
  p_schedule_name text default 'cleanup-notification-dispatch-jobs-daily',
  p_cron_expression text default '15 3 * * *',
  p_keep_sent_days integer default 14,
  p_keep_failed_days integer default 30
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_job_id bigint;
  new_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = p_schedule_name
  order by jobid desc
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  select cron.schedule(
    p_schedule_name,
    p_cron_expression,
    format(
      $job$
        select * from public.cleanup_terminal_notification_dispatch_jobs(%s, %s);
      $job$,
      greatest(coalesce(p_keep_sent_days, 14), 1),
      greatest(coalesce(p_keep_failed_days, 30), 1)
    )
  )
  into new_job_id;

  return new_job_id;
end;
$$;

create or replace function public.disable_notification_dispatch_cleanup_schedule(
  p_schedule_name text default 'cleanup-notification-dispatch-jobs-daily'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = p_schedule_name
  order by jobid desc
  limit 1;

  if existing_job_id is null then
    return false;
  end if;

  perform cron.unschedule(existing_job_id);
  return true;
end;
$$;

grant execute on function public.invoke_dispatch_reminder_notifications(integer, text) to service_role;
grant execute on function public.enable_dispatch_reminder_schedule(text, text, integer, text) to service_role;
grant execute on function public.disable_dispatch_reminder_schedule(text) to service_role;
grant execute on function public.enable_notification_dispatch_cleanup_schedule(text, text, integer, integer) to service_role;
grant execute on function public.disable_notification_dispatch_cleanup_schedule(text) to service_role;
