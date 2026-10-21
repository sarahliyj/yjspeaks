-- Public YJ Speaks newsletter signups are separate from authenticated Bym
-- publication subscriptions. They become confirmed only after email opt-in.

create table if not exists public.newsletter_subscribers (
  id text primary key,
  email_normalized text not null unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  source text not null default 'yjspeaks',
  consented_at bigint not null,
  confirmed_at bigint,
  unsubscribed_at bigint,
  created_at bigint not null,
  updated_at bigint not null
);

create index if not exists idx_newsletter_subscribers_status
  on public.newsletter_subscribers(status, updated_at desc);

alter table public.newsletter_subscribers enable row level security;
grant all on public.newsletter_subscribers to service_role;
