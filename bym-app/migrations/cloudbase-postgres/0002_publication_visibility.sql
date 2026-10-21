-- Keep draft publications private, activate them on first publish, and avoid
-- exposing private account columns through the anonymous REST role.

drop policy if exists publications_public_read on public.publications;
create policy publications_public_read on public.publications
for select to anon, authenticated
using (status = 'active' or owner_auth_subject = auth.uid());

revoke select on public.users from anon, authenticated;
grant select (id, display_name, avatar_url, bio, account_status)
on public.users to anon, authenticated;

create or replace function public.publish_article(
  article_id_input text,
  slug_input text,
  published_at_input bigint
)
returns public.articles
language plpgsql
security invoker
as $$
declare
  published public.articles;
begin
  update public.articles
     set slug = slug_input,
         status = 'published',
         published_at = coalesce(published_at, published_at_input),
         updated_at = published_at_input
   where id = article_id_input
     and author_auth_subject = auth.uid()
  returning * into published;

  if published.id is null then
    raise exception 'article_not_found';
  end if;

  update public.publications
     set status = 'active', updated_at = published_at_input
   where id = published.publication_id
     and owner_auth_subject = auth.uid();

  return published;
end;
$$;
