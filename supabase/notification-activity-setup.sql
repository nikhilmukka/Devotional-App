create index if not exists notification_logs_recent_user_idx
  on public.notification_logs (user_id, created_at desc);

drop policy if exists "notification_logs_insert_own" on public.notification_logs;
create policy "notification_logs_insert_own"
on public.notification_logs
for insert
with check (auth.uid() = user_id);
