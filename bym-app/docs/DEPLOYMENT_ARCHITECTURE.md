# Bym deployment architecture

## Deployment boundaries

- `yjspeaks.com` remains the YJ Speaks shell and navigation project.
- Bym lives in the `bym-app/` subtree of the YJ Speaks repository, but remains an independent Next.js project and deployment.
- The subtree has no imports from the YJ Speaks shell, so it can later move to its own repository without application-code changes.
- Vercel routes `/bym` and `/bym/*` from YJ Speaks to the Bym deployment.
- Bym uses `NEXT_PUBLIC_BASE_PATH=/bym` today. A future standalone domain sets it to an empty string.
- Browser and future native clients use the same `/api/*` contract. UI components do not access CloudBase directly.

This makes the current path integration reversible: moving Bym to `bym.cn`, another host, or a native app does not require rewriting the domain or database layer.

## Service boundaries

- Web UI: Bym Next.js deployment on Vercel.
- API: Next.js route handlers, kept inside the Bym deployment until traffic justifies a separate API service.
- Authentication: Tencent CloudBase email/password authentication.
- Relational data: the existing Tencent CloudBase PostgreSQL database, exposed through PostgREST and transactional RPC functions.
- Images: use object storage URLs in the data model. Storage can move independently from the database.

## Environment variables

| Variable | Current integrated deployment | Future standalone deployment |
| --- | --- | --- |
| `SITE_ORIGIN` | `https://yjspeaks.com/bym` | Bym's standalone origin |
| `NEXT_PUBLIC_BASE_PATH` | `/bym` | empty |
| `CLOUDBASE_ENV_ID` | CloudBase environment ID | unchanged or a new environment |
| `CLOUDBASE_PUBLISHABLE_KEY` | Vercel server secret used for public/authenticated requests | Vercel/server secret |
| `NEWSLETTER_SIGNUP_SECRET` | Vercel server secret accepted only by the newsletter signup RPC | Vercel/server secret |

Keep the CloudBase publishable key in deployment configuration and never commit deployment credentials to Git. `NEWSLETTER_SIGNUP_SECRET` must only be read inside server route handlers and repository functions.

## Migration order

1. Run `migrations/cloudbase-postgres/0001_initial.sql` in the existing CloudBase PostgreSQL environment.
2. Export and transform existing D1 rows, preserving domain `id` values and copying them to CloudBase `_id`.
3. Import into CloudBase in foreign-key order: users, publications, articles, revisions, subscriptions, inbox, saved/progress, outbox, consent.
4. Create a separate Vercel Bym project with the four environment variables above.
5. Test signup, persistent login, draft, publish, discover, subscribe, and inbox on a preview deployment.
6. Route `yjspeaks.com/bym/*` to Bym and remove the old external redirect only after preview verification.

## Transactions

CloudBase PostgreSQL's client SDK does not expose transactions directly. Multi-table operations are therefore implemented as PostgreSQL RPC functions, which execute atomically inside the database.
