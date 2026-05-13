create or replace function public.admin_get_reminder_diagnostics()
returns jsonb
language plpgsql
security definer
set search_path = public, cron
as $$
declare
  current_user_id uuid := auth.uid();
  current_is_admin boolean := false;
begin
  if current_user_id is null then
    raise exception 'Authentication required to view admin diagnostics.';
  end if;

  select coalesce(is_admin, false)
  into current_is_admin
  from public.profiles
  where id = current_user_id;

  if not current_is_admin then
    raise exception 'Admin access required to view reminder diagnostics.';
  end if;

  return jsonb_build_object(
    'schedules',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'jobId', schedule_rows.jobid,
            'jobName', schedule_rows.jobname,
            'schedule', schedule_rows.schedule,
            'active', schedule_rows.active,
            'command', schedule_rows.command
          )
          order by schedule_rows.jobname
        )
        from (
          select jobid, jobname, schedule, active, command
          from cron.job
          where jobname in (
            'dispatch-reminder-notifications-every-5-minutes',
            'cleanup-notification-dispatch-jobs-daily'
          )
        ) as schedule_rows
      ),
      '[]'::jsonb
    ),
    'queueSummary',
    (
      select jsonb_build_object(
        'total', count(*)::int,
        'queued', count(*) filter (where job_status = 'queued')::int,
        'processing', count(*) filter (where job_status = 'processing')::int,
        'sent', count(*) filter (where job_status = 'sent')::int,
        'failed', count(*) filter (where job_status = 'failed')::int,
        'canceled', count(*) filter (where job_status = 'canceled')::int,
        'skipped', count(*) filter (where job_status = 'skipped')::int,
        'lastQueuedAt', max(created_at) filter (where job_status = 'queued'),
        'lastSentAt', max(sent_at) filter (where job_status = 'sent'),
        'lastFailureAt', max(updated_at) filter (where job_status = 'failed')
      )
      from public.notification_dispatch_jobs
    ),
    'activitySummary',
    (
      select jsonb_build_object(
        'total', count(*)::int,
        'sent', count(*) filter (where status = 'sent')::int,
        'failed', count(*) filter (where status = 'failed')::int,
        'skipped', count(*) filter (where status = 'skipped')::int,
        'canceled', count(*) filter (where status = 'canceled')::int,
        'lastSentAt', max(sent_at) filter (where status = 'sent'),
        'lastFailureAt', max(created_at) filter (where status = 'failed')
      )
      from public.notification_logs
    ),
    'recentJobs',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', recent_jobs.id,
            'status', recent_jobs.job_status,
            'provider', recent_jobs.provider,
            'regionCode', recent_jobs.region_code,
            'scheduledForLocal', recent_jobs.scheduled_for_local,
            'attemptCount', recent_jobs.attempt_count,
            'maxAttempts', recent_jobs.max_attempts,
            'nextAttemptAt', recent_jobs.next_attempt_at,
            'lastError', recent_jobs.last_error,
            'prayerSlug', prayer.slug,
            'updatedAt', recent_jobs.updated_at,
            'sentAt', recent_jobs.sent_at,
            'userEmail', profile.email
          )
          order by recent_jobs.updated_at desc
        )
        from (
          select *
          from public.notification_dispatch_jobs
          order by updated_at desc
          limit 12
        ) as recent_jobs
        left join public.prayers prayer
          on prayer.id = recent_jobs.prayer_id
        left join public.profiles profile
          on profile.id = recent_jobs.user_id
      ),
      '[]'::jsonb
    ),
    'recentActivity',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', recent_logs.id,
            'status', recent_logs.status,
            'provider', recent_logs.provider,
            'createdAt', recent_logs.created_at,
            'sentAt', recent_logs.sent_at,
            'prayerSlug', prayer.slug,
            'userEmail', profile.email
          )
          order by recent_logs.created_at desc
        )
        from (
          select *
          from public.notification_logs
          order by created_at desc
          limit 12
        ) as recent_logs
        left join public.prayers prayer
          on prayer.id = recent_logs.prayer_id
        left join public.profiles profile
          on profile.id = recent_logs.user_id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

grant execute on function public.admin_get_reminder_diagnostics() to authenticated;
