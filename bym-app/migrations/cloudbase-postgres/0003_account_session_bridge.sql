-- Bridge CloudBase Auth identities into private Bym profiles without granting
-- authenticated clients broad SELECT access to sensitive user columns.

create or replace function public.ensure_app_user(
  email_input text,
  display_name_input text,
  now_input bigint
)
returns table (
  id text,
  display_name text,
  account_status text,
  identity_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  subject text := auth.uid();
begin
  if subject is null or subject = '' then
    raise exception 'authentication_required';
  end if;

  return query
  insert into public.users (
    id,
    external_auth_subject,
    email_normalized,
    email_verified_at,
    display_name,
    account_status,
    identity_status,
    created_at,
    updated_at
  ) values (
    gen_random_uuid()::text,
    subject,
    lower(trim(email_input)),
    now_input,
    coalesce(nullif(trim(display_name_input), ''), lower(trim(email_input))),
    'active',
    'verified',
    now_input,
    now_input
  )
  on conflict (external_auth_subject) do update set
    email_normalized = excluded.email_normalized,
    email_verified_at = excluded.email_verified_at,
    display_name = case
      when public.users.profile_completed_at is null then excluded.display_name
      else public.users.display_name
    end,
    identity_status = 'verified',
    updated_at = excluded.updated_at
  returning
    public.users.id,
    public.users.display_name,
    public.users.account_status,
    public.users.identity_status;
end;
$$;

create or replace function public.get_my_profile()
returns table (
  id text,
  display_name text,
  avatar_url text,
  bio text,
  profile_completed_at bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select u.id, u.display_name, u.avatar_url, u.bio, u.profile_completed_at
  from public.users u
  where u.external_auth_subject = auth.uid()
  limit 1;
$$;

create or replace function public.update_my_profile(
  display_name_input text,
  bio_input text,
  avatar_url_input text,
  now_input bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set display_name = display_name_input,
      bio = bio_input,
      avatar_url = avatar_url_input,
      profile_completed_at = now_input,
      updated_at = now_input
  where external_auth_subject = auth.uid();

  if not found then
    raise exception 'profile_not_found';
  end if;
end;
$$;

create or replace function public.skip_my_profile_setup(now_input bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set profile_completed_at = now_input,
      updated_at = now_input
  where external_auth_subject = auth.uid();

  if not found then
    raise exception 'profile_not_found';
  end if;
end;
$$;

revoke all on function public.ensure_app_user(text, text, bigint) from public;
revoke all on function public.get_my_profile() from public;
revoke all on function public.update_my_profile(text, text, text, bigint) from public;
revoke all on function public.skip_my_profile_setup(bigint) from public;

grant execute on function public.ensure_app_user(text, text, bigint) to authenticated;
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.update_my_profile(text, text, text, bigint) to authenticated;
grant execute on function public.skip_my_profile_setup(bigint) to authenticated;
