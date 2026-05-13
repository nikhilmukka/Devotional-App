# Notification Dispatch Runbook

This runbook covers the reminder delivery backend for BhaktiVerse.

## Purpose

The app already lets users:

- register an Expo push token
- resolve the active reminder for a given day
- queue dispatch jobs
- view queue/activity history in mobile and web

This runbook adds the final missing backend step:

- claim queued jobs
- send Expo push notifications
- mark each job as `sent` or `failed`
- write the result into `notification_logs`

## Required SQL

Run these in Supabase SQL Editor if you have not already:

1. [reminder-engine-setup.sql](../supabase/reminder-engine-setup.sql)
2. [notification-activity-setup.sql](../supabase/notification-activity-setup.sql)
3. [notification-dispatch-setup.sql](../supabase/notification-dispatch-setup.sql)

## Edge Function

Function path:

- [supabase/functions/dispatch-reminder-notifications/index.ts](../supabase/functions/dispatch-reminder-notifications/index.ts)

This function:

- claims due queued jobs through `claim_due_notification_dispatch_jobs`
- sends each job to Expo Push
- completes each job through `complete_notification_dispatch_job`
- writes delivery results to `notification_logs`

## Deploy

From the project root:

```bash
supabase functions deploy dispatch-reminder-notifications
```

The function expects these standard Supabase environment variables in the Edge Function runtime:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Invoke Manually

Example manual trigger:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/dispatch-reminder-notifications" \
  -H "Authorization: Bearer <service-role-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"maxJobs":25,"regionCode":"global"}'
```

Notes:

- `regionCode` is optional
- `maxJobs` defaults to `25`
- this endpoint is intended for backend/ops usage, not public client usage

## Test Flow

1. Sign in on mobile with a real email account.
2. Open `Reminders`.
3. Tap `Enable on This iPhone` if needed.
4. Tap `Queue Today's Reminder`.
5. Confirm jobs appear in `Reminder Dispatch Queue`.
6. Invoke the edge function.
7. Reopen `Reminders` on mobile or web.
8. Confirm queued jobs move to `sent` or `failed`.
9. Confirm `Recent Notification Activity` shows the delivery result.

## Expected Status Lifecycle

- `queued`
- `processing`
- `sent`

Possible failure states:

- `failed`
- `skipped`
- `canceled`

## Current Scope

This first version is intentionally simple:

- one Expo push send per claimed job
- simple devotional title/body generation
- delivery results stored in Supabase

Future upgrades can add:

- batching
- richer localized notification copy
- admin diagnostics

## Automatic Scheduling

Supabase officially supports scheduled Edge Function invocation with:

- `pg_cron`
- `pg_net`
- `Vault`

Reference:

- https://supabase.com/docs/guides/functions/schedule-functions

To enable automatic reminder dispatch in this project:

1. Run [notification-dispatch-scheduler-setup.sql](../supabase/notification-dispatch-scheduler-setup.sql)
2. Create these Vault secrets in Supabase:
   - `project_url`
   - `reminder_dispatch_bearer_token`
3. Enable the recurring schedule:

```sql
select public.enable_dispatch_reminder_schedule();
```

Default behavior:

- schedule name: `dispatch-reminder-notifications-every-5-minutes`
- cron: `*/5 * * * *`
- max jobs per run: `25`
- region code: `global`

Useful controls:

```sql
select public.disable_dispatch_reminder_schedule();
```

```sql
select public.enable_dispatch_reminder_schedule(
  p_schedule_name := 'dispatch-reminder-notifications-every-minute',
  p_cron_expression := '* * * * *',
  p_max_jobs := 25,
  p_region_code := 'global'
);
```

Notes:

- Keep the in-app `Run Reminder Dispatch` button only as a development fallback until the cron schedule is verified.
- The bearer token secret should be a valid token that your project accepts for invoking Edge Functions.

## Retry And Cleanup

The dispatch queue now supports:

- automatic retry backoff for failed sends
- a maximum attempt limit per job
- cleanup of older terminal jobs

Retry behavior:

- first failure: retry after 5 minutes
- second failure: retry after 15 minutes
- third failure: retry after 1 hour
- later failures: retry after 3 hours until `max_attempts` is reached

Once the max attempt limit is reached, the job remains `failed`.

Cleanup helper:

```sql
select * from public.cleanup_terminal_notification_dispatch_jobs();
```

Default cleanup windows:

- sent / canceled / skipped: keep 14 days
- failed: keep 30 days

## Automatic Cleanup Scheduling

The cleanup helper can also be scheduled automatically with `pg_cron`.

Enable the default cleanup schedule:

```sql
select public.enable_notification_dispatch_cleanup_schedule();
```

Default behavior:

- schedule name: `cleanup-notification-dispatch-jobs-daily`
- cron: `15 3 * * *`
- sent / canceled / skipped: keep 14 days
- failed: keep 30 days

Disable it:

```sql
select public.disable_notification_dispatch_cleanup_schedule();
```

Custom example:

```sql
select public.enable_notification_dispatch_cleanup_schedule(
  p_schedule_name := 'cleanup-notification-dispatch-jobs-hourly',
  p_cron_expression := '0 * * * *',
  p_keep_sent_days := 7,
  p_keep_failed_days := 14
);
```
