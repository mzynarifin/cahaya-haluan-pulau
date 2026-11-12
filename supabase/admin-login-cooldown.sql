-- Run once in the Supabase SQL Editor before enabling SUPABASE_SECRET_KEY in the app.
-- Five incorrect password attempts within 15 minutes trigger a 15-minute cooldown.

create table if not exists public.admin_login_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  failed_attempts smallint not null default 0 check (failed_attempts between 0 and 5),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.admin_login_attempts enable row level security;
revoke all on table public.admin_login_attempts from public, anon, authenticated, service_role;

create or replace function public.admin_login_cooldown_remaining(p_email text)
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
  select coalesce((
    select greatest(0, ceil(extract(epoch from (attempts.locked_until - clock_timestamp())))::integer)
    from public.admin_login_attempts as attempts
    join auth.users as auth_user on auth_user.id = attempts.user_id
    join public.admin_users as admin_user on admin_user.user_id = auth_user.id
    where lower(auth_user.email) = lower(btrim(p_email))
      and attempts.locked_until > clock_timestamp()
    limit 1
  ), 0);
$$;

create or replace function public.record_admin_login_failure(p_email text)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_now timestamptz := clock_timestamp();
  v_locked_until timestamptz;
begin
  if p_email is null or length(btrim(p_email)) not between 3 and 254 then
    return 0;
  end if;

  select auth_user.id
  into v_user_id
  from auth.users as auth_user
  join public.admin_users as admin_user on admin_user.user_id = auth_user.id
  where lower(auth_user.email) = lower(btrim(p_email))
  limit 1;

  -- Unknown and non-admin addresses do not create rows or reveal account status.
  if v_user_id is null then
    return 0;
  end if;

  insert into public.admin_login_attempts as attempts (
    user_id, failed_attempts, window_started_at, locked_until, updated_at
  ) values (
    v_user_id, 1, v_now, null, v_now
  )
  on conflict (user_id) do update set
    failed_attempts = case
      when attempts.locked_until > v_now then attempts.failed_attempts
      when attempts.window_started_at <= v_now - interval '15 minutes' then 1
      else attempts.failed_attempts + 1
    end,
    window_started_at = case
      when attempts.locked_until > v_now then attempts.window_started_at
      when attempts.window_started_at <= v_now - interval '15 minutes' then v_now
      else attempts.window_started_at
    end,
    locked_until = case
      when attempts.locked_until > v_now then attempts.locked_until
      when attempts.window_started_at <= v_now - interval '15 minutes' then null
      when attempts.failed_attempts + 1 >= 5 then v_now + interval '15 minutes'
      else null
    end,
    updated_at = v_now
  returning attempts.locked_until into v_locked_until;

  if v_locked_until is null or v_locked_until <= v_now then
    return 0;
  end if;

  return greatest(1, ceil(extract(epoch from (v_locked_until - v_now)))::integer);
end;
$$;

create or replace function public.clear_admin_login_failures(p_email text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  if p_email is null or length(btrim(p_email)) not between 3 and 254 then
    return;
  end if;

  select auth_user.id
  into v_user_id
  from auth.users as auth_user
  join public.admin_users as admin_user on admin_user.user_id = auth_user.id
  where lower(auth_user.email) = lower(btrim(p_email))
  limit 1;

  if v_user_id is not null then
    delete from public.admin_login_attempts where user_id = v_user_id;
  end if;
end;
$$;

revoke all on function public.admin_login_cooldown_remaining(text) from public, anon, authenticated;
revoke all on function public.record_admin_login_failure(text) from public, anon, authenticated;
revoke all on function public.clear_admin_login_failures(text) from public, anon, authenticated;
grant execute on function public.admin_login_cooldown_remaining(text) to service_role;
grant execute on function public.record_admin_login_failure(text) to service_role;
grant execute on function public.clear_admin_login_failures(text) to service_role;
