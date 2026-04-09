do $$
begin
  create type public.subscription_tier as enum (
    'free',
    'premium_individual',
    'premium_family'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.entitlement_status as enum (
    'inactive',
    'trial',
    'active',
    'grace_period',
    'canceled',
    'expired'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subscription_tier public.subscription_tier not null default 'free',
  entitlement_status public.entitlement_status not null default 'inactive',
  provider text not null default 'manual',
  provider_customer_id text,
  provider_subscription_id text,
  product_code text,
  valid_until timestamptz,
  is_lifetime boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_user_entitlements_status
  on public.user_entitlements (entitlement_status, subscription_tier);

drop trigger if exists set_user_entitlements_updated_at on public.user_entitlements;
create trigger set_user_entitlements_updated_at
before update on public.user_entitlements
for each row execute function public.set_updated_at();

alter table public.user_entitlements enable row level security;

drop policy if exists "entitlements_select_own" on public.user_entitlements;
create policy "entitlements_select_own"
on public.user_entitlements
for select
using (auth.uid() = user_id);

drop policy if exists "entitlements_insert_own" on public.user_entitlements;
create policy "entitlements_insert_own"
on public.user_entitlements
for insert
with check (auth.uid() = user_id);

drop policy if exists "entitlements_update_own" on public.user_entitlements;
create policy "entitlements_update_own"
on public.user_entitlements
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
