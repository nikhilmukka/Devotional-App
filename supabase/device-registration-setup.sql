create or replace function public.register_my_device(
  p_platform public.device_platform,
  p_expo_push_token text,
  p_device_name text default null,
  p_app_version text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_device_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required to register a device';
  end if;

  if p_expo_push_token is null or length(trim(p_expo_push_token)) = 0 then
    raise exception 'Expo push token is required';
  end if;

  select id
  into existing_device_id
  from public.user_devices
  where expo_push_token = p_expo_push_token
  limit 1;

  if existing_device_id is not null then
    update public.user_devices
    set
      user_id = current_user_id,
      platform = p_platform,
      device_name = p_device_name,
      app_version = p_app_version,
      is_active = true,
      last_seen_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
    where id = existing_device_id;

    return existing_device_id;
  end if;

  select id
  into existing_device_id
  from public.user_devices
  where user_id = current_user_id
    and platform = p_platform
    and is_active = true
  order by updated_at desc nulls last, created_at desc
  limit 1;

  if existing_device_id is not null then
    update public.user_devices
    set
      expo_push_token = p_expo_push_token,
      device_name = p_device_name,
      app_version = p_app_version,
      is_active = true,
      last_seen_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
    where id = existing_device_id;

    return existing_device_id;
  end if;

  insert into public.user_devices (
    user_id,
    platform,
    expo_push_token,
    device_name,
    app_version,
    is_active,
    last_seen_at
  )
  values (
    current_user_id,
    p_platform,
    p_expo_push_token,
    p_device_name,
    p_app_version,
    true,
    timezone('utc', now())
  )
  returning id into existing_device_id;

  return existing_device_id;
end;
$$;

grant execute on function public.register_my_device(public.device_platform, text, text, text) to authenticated;
