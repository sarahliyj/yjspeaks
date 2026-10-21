-- Newsletter signups arrive through one narrow security-definer function.
-- The shared secret is provisioned separately and is never committed to Git.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
revoke all on public.newsletter_subscribers from service_role;

create table if not exists private.newsletter_signup_config (
  name text primary key,
  secret text not null,
  updated_at bigint not null
);

revoke all on private.newsletter_signup_config from public, anon, authenticated;

create or replace function public.subscribe_newsletter(email_input text, secret_input text)
returns table(subscriber_id text, subscriber_status text)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  configured_secret text;
  normalized_email text;
  current_time bigint;
begin
  select config.secret
    into configured_secret
    from private.newsletter_signup_config config
   where config.name = 'primary';

  if configured_secret is null or secret_input is distinct from configured_secret then
    raise exception 'unauthorized newsletter signup' using errcode = '42501';
  end if;

  normalized_email := lower(trim(email_input));
  if length(normalized_email) < 3
     or length(normalized_email) > 254
     or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;

  current_time := floor(extract(epoch from clock_timestamp()) * 1000)::bigint;

  insert into public.newsletter_subscribers (
    id,
    email_normalized,
    status,
    source,
    consented_at,
    confirmed_at,
    unsubscribed_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid()::text,
    normalized_email,
    'pending',
    'yjspeaks',
    current_time,
    null,
    null,
    current_time,
    current_time
  )
  on conflict (email_normalized) do update set
    status = 'pending',
    source = 'yjspeaks',
    consented_at = excluded.consented_at,
    unsubscribed_at = null,
    updated_at = excluded.updated_at
  returning newsletter_subscribers.id, newsletter_subscribers.status
       into subscriber_id, subscriber_status;

  return next;
end;
$$;

revoke all on function public.subscribe_newsletter(text, text) from public;
grant execute on function public.subscribe_newsletter(text, text) to anon;
