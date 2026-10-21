-- Bym schema for Tencent CloudBase PostgreSQL.
-- Domain IDs stay as text so the web app and a future native app share one API.

create table if not exists public.users (
  id text primary key,
  external_auth_subject text not null unique default auth.uid(),
  email_normalized text not null unique default auth.email(),
  email_verified_at bigint,
  display_name text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  profile_completed_at bigint,
  account_status text not null default 'active',
  identity_status text not null default 'verified',
  deleted_at bigint,
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists public.publications (
  id text primary key,
  owner_user_id text not null unique references public.users(id) on delete cascade,
  owner_auth_subject text not null default auth.uid(),
  name text not null,
  handle text not null unique,
  description text not null default '',
  status text not null default 'draft',
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists public.articles (
  id text primary key,
  publication_id text not null references public.publications(id) on delete cascade,
  author_user_id text not null references public.users(id) on delete restrict,
  author_auth_subject text not null default auth.uid(),
  slug text not null,
  title text not null default '无标题',
  subtitle text not null default '',
  cover_image_url text not null default '',
  body_document text not null default '{}',
  body_text text not null default '',
  status text not null default 'draft',
  send_email boolean not null default false,
  published_at bigint,
  created_at bigint not null,
  updated_at bigint not null,
  unique (publication_id, slug)
);

create table if not exists public.article_revisions (
  id text primary key,
  article_id text not null references public.articles(id) on delete cascade,
  editor_user_id text not null references public.users(id) on delete restrict,
  editor_auth_subject text not null default auth.uid(),
  title text not null,
  subtitle text not null default '',
  body_document text not null,
  body_text text not null,
  reason text not null default 'autosave',
  created_at bigint not null
);

create table if not exists public.subscriptions (
  id text primary key,
  subscriber_user_id text not null references public.users(id) on delete cascade,
  subscriber_auth_subject text not null default auth.uid(),
  publication_id text not null references public.publications(id) on delete cascade,
  status text not null default 'active',
  email_delivery boolean not null default false,
  created_at bigint not null,
  updated_at bigint not null,
  unique (subscriber_user_id, publication_id)
);

create table if not exists public.inbox_items (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  user_auth_subject text not null,
  article_id text not null references public.articles(id) on delete cascade,
  delivered_at bigint not null,
  read_at bigint,
  archived_at bigint,
  unique (user_id, article_id)
);

create table if not exists public.saved_articles (
  user_id text not null references public.users(id) on delete cascade,
  user_auth_subject text not null default auth.uid(),
  article_id text not null references public.articles(id) on delete cascade,
  saved_at bigint not null,
  primary key (user_id, article_id)
);

create table if not exists public.reading_progress (
  user_id text not null references public.users(id) on delete cascade,
  user_auth_subject text not null default auth.uid(),
  article_id text not null references public.articles(id) on delete cascade,
  percent integer not null default 0 check (percent between 0 and 100),
  position text not null default '',
  updated_at bigint not null,
  primary key (user_id, article_id)
);

create table if not exists public.outbox_events (
  id text primary key,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  payload text not null,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  available_at bigint not null,
  processed_at bigint,
  created_at bigint not null
);

create table if not exists public.consent_records (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  user_auth_subject text not null default auth.uid(),
  document_type text not null,
  document_version text not null,
  locale text not null default 'zh-CN',
  accepted_at bigint not null
);

create index if not exists idx_articles_publication_status_published on public.articles(publication_id, status, published_at desc);
create index if not exists idx_articles_author_status on public.articles(author_user_id, status);
create index if not exists idx_article_revisions_article_created on public.article_revisions(article_id, created_at desc);
create index if not exists idx_subscriptions_publication_status on public.subscriptions(publication_id, status);
create index if not exists idx_inbox_items_user_delivered on public.inbox_items(user_id, delivered_at desc);
create index if not exists idx_saved_articles_user_saved on public.saved_articles(user_id, saved_at desc);
create index if not exists idx_outbox_events_status_available on public.outbox_events(status, available_at);

alter table public.users enable row level security;
alter table public.publications enable row level security;
alter table public.articles enable row level security;
alter table public.article_revisions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.inbox_items enable row level security;
alter table public.saved_articles enable row level security;
alter table public.reading_progress enable row level security;
alter table public.outbox_events enable row level security;
alter table public.consent_records enable row level security;

grant select on public.users, public.publications, public.articles to anon;
grant select on public.users, public.publications, public.articles to authenticated;
grant insert, update on public.users, public.publications, public.articles, public.article_revisions, public.subscriptions, public.inbox_items, public.saved_articles, public.reading_progress, public.consent_records to authenticated;
grant select on public.article_revisions, public.subscriptions, public.inbox_items, public.saved_articles, public.reading_progress, public.consent_records to authenticated;
grant all on all tables in schema public to service_role;

drop policy if exists users_public_read on public.users;
create policy users_public_read on public.users for select to anon, authenticated using (account_status = 'active');
drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users for insert to authenticated with check (external_auth_subject = auth.uid());
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users for update to authenticated using (external_auth_subject = auth.uid()) with check (external_auth_subject = auth.uid());

drop policy if exists publications_public_read on public.publications;
create policy publications_public_read on public.publications for select to anon, authenticated using (status in ('active', 'draft'));
drop policy if exists publications_insert_self on public.publications;
create policy publications_insert_self on public.publications for insert to authenticated with check (owner_auth_subject = auth.uid());
drop policy if exists publications_update_self on public.publications;
create policy publications_update_self on public.publications for update to authenticated using (owner_auth_subject = auth.uid()) with check (owner_auth_subject = auth.uid());

drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles for select to anon, authenticated using (status = 'published' or author_auth_subject = auth.uid());
drop policy if exists articles_insert_self on public.articles;
create policy articles_insert_self on public.articles for insert to authenticated with check (author_auth_subject = auth.uid());
drop policy if exists articles_update_self on public.articles;
create policy articles_update_self on public.articles for update to authenticated using (author_auth_subject = auth.uid()) with check (author_auth_subject = auth.uid());

drop policy if exists revisions_owner_access on public.article_revisions;
create policy revisions_owner_access on public.article_revisions for all to authenticated using (editor_auth_subject = auth.uid()) with check (editor_auth_subject = auth.uid());
drop policy if exists subscriptions_owner_access on public.subscriptions;
create policy subscriptions_owner_access on public.subscriptions for all to authenticated using (subscriber_auth_subject = auth.uid()) with check (subscriber_auth_subject = auth.uid());
drop policy if exists inbox_owner_access on public.inbox_items;
create policy inbox_owner_access on public.inbox_items for all to authenticated using (user_auth_subject = auth.uid()) with check (user_auth_subject = auth.uid());
drop policy if exists saved_owner_access on public.saved_articles;
create policy saved_owner_access on public.saved_articles for all to authenticated using (user_auth_subject = auth.uid()) with check (user_auth_subject = auth.uid());
drop policy if exists progress_owner_access on public.reading_progress;
create policy progress_owner_access on public.reading_progress for all to authenticated using (user_auth_subject = auth.uid()) with check (user_auth_subject = auth.uid());
drop policy if exists consent_owner_access on public.consent_records;
create policy consent_owner_access on public.consent_records for all to authenticated using (user_auth_subject = auth.uid()) with check (user_auth_subject = auth.uid());

-- Transactional publishing: one RPC updates the article and queues delivery.
create or replace function public.publish_article(article_id_input text, slug_input text, published_at_input bigint)
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

  return published;
end;
$$;

revoke execute on function public.publish_article(text, text, bigint) from public;
grant execute on function public.publish_article(text, text, bigint) to authenticated;
