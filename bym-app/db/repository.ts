import { DomainError, normalizeEmail } from '@/lib/domain';
import { rdbRequest, rdbRpc, rdbTable } from '@/lib/cloudbase-rdb';

export type AppIdentity = { userId: string; displayName: string; email: string };
export type AppUser = { id: string; email: string; displayName: string; accountStatus: string; identityStatus: string; accessToken?: string };
export type ProfileInput = { displayName: string; bio: string; avatarUrl: string };
export type DraftInput = { title: string; subtitle: string; coverImageUrl: string; bodyDocument: string; bodyText: string };
export type PublishedArticle = { id: string; slug: string; title: string; subtitle: string; bodyDocument: string; bodyText: string; coverImageUrl: string; publishedAt: number; publicationName: string; publicationHandle: string; publicationDescription: string; authorName: string; authorAvatar: string };
type Row = Record<string, unknown>;
const ARTICLE_SELECT = 'id,slug,title,subtitle,body_document,body_text,cover_image_url,status,send_email,published_at,updated_at,publication:publications!articles_publication_id_fkey(id,name,handle,description),author:users!articles_author_user_id_fkey(display_name,avatar_url)';

export async function ensureAppUser(identity: AppIdentity, token: string): Promise<AppUser> {
  const email = normalizeEmail(identity.email);
  const now = Date.now();
  try {
    const rows = await rdbRpc<Row[]>('ensure_app_user', {
      email_input: email,
      display_name_input: identity.displayName,
      now_input: now,
    }, token);
    if (!rows[0]) throw new Error('Account provisioning did not return a user.');
    return { ...mapUser(rows[0]), email };
  } catch (error) {
    if (!isUniqueError(error)) throw error;
    throw new DomainError('ACCOUNT_CONFLICT', '这个邮箱已关联到另一个账号。', 409);
  }
}

export async function getWriterWorkspace(user: AppUser) {
  const token = requireToken(user);
  const pubs = await table('publications', { select: 'id,name,handle,description,status,created_at,updated_at', owner_user_id: `eq.${user.id}`, limit: '1' }, token);
  const publication = pubs[0] ? mapPublication(pubs[0]) : null;
  const articles = publication ? await table('articles', { select: 'id,title,subtitle,cover_image_url,status,updated_at,published_at', publication_id: `eq.${publication.id}`, order: 'updated_at.desc', limit: '30' }, token) : [];
  return { publication, articles: articles.map(mapSummary) };
}

export async function getProfile(user: AppUser) {
  const token = requireToken(user);
  const [users, pubs, ownSubs] = await Promise.all([
    rdbRpc<Row[]>('get_my_profile', {}, token),
    table('publications', { select: 'id,name,handle', owner_user_id: `eq.${user.id}`, limit: '1' }, token),
    table('subscriptions', { select: 'id,publication:publications!subscriptions_publication_id_fkey(id,name,handle,owner:users!publications_owner_user_id_fkey(display_name))', subscriber_user_id: `eq.${user.id}`, status: 'eq.active', order: 'updated_at.desc' }, token),
  ]);
  if (!users[0]) throw new DomainError('PROFILE_NOT_FOUND', '没有找到账号资料。', 404);
  const pub = pubs[0];
  const [followers, articles] = await Promise.all([
    pub ? table('subscriptions', { select: 'id', publication_id: `eq.${str(pub.id)}`, status: 'eq.active' }, token) : [],
    table('articles', { select: ARTICLE_SELECT, author_user_id: `eq.${user.id}`, status: 'eq.published', order: 'published_at.desc', limit: '30' }, token),
  ]);
  const row = users[0];
  return {
    profile: { id: str(row.id), email: user.email, displayName: str(row.display_name), avatarUrl: str(row.avatar_url), bio: str(row.bio), profileCompletedAt: nullableNum(row.profile_completed_at), publicationId: pub ? str(pub.id) : null, publicationName: pub ? str(pub.name) : null, publicationHandle: pub ? str(pub.handle) : null, subscriberCount: followers.length, subscriptionCount: ownSubs.length },
    articles: articles.map(mapFeed),
    subscriptions: ownSubs.map((subscription) => {
      const publication = relation(subscription.publication);
      const owner = relation(publication.owner);
      return { id: str(publication.id), name: str(publication.name), handle: str(publication.handle), authorName: str(owner.display_name) };
    }),
  };
}

export async function updateProfile(user: AppUser, input: ProfileInput) {
  const now = Date.now();
  await rdbRpc('update_my_profile', {
    display_name_input: input.displayName,
    bio_input: input.bio,
    avatar_url_input: input.avatarUrl,
    now_input: now,
  }, requireToken(user));
  return getProfile(user);
}
export async function skipProfileSetup(user: AppUser) {
  const now = Date.now();
  await rdbRpc('skip_my_profile_setup', { now_input: now }, requireToken(user));
  return getProfile(user);
}

export async function createPublication(user: AppUser, input: { name: string; handle: string; description: string }) {
  requireActive(user); const now = Date.now(); const id = crypto.randomUUID();
  try { await post('publications', [{ id, owner_user_id: user.id, name: input.name, handle: input.handle, description: input.description, status: 'draft', created_at: now, updated_at: now }], requireToken(user)); }
  catch (error) { if (isUniqueError(error)) throw new DomainError('PUBLICATION_CONFLICT', '你已经创建过刊物，或这个刊物地址已被使用。', 409); throw error; }
  return { id, ...input, status: 'draft', createdAt: now, updatedAt: now };
}

export async function createDraft(user: AppUser, input: DraftInput) {
  requireActive(user); const token = requireToken(user); const pub = await ownedPublication(user);
  const id = crypto.randomUUID(); const now = Date.now(); const slug = `draft-${id.slice(0, 8)}`;
  await post('articles', [{ id, publication_id: pub.id, author_user_id: user.id, slug, title: input.title, subtitle: input.subtitle, cover_image_url: input.coverImageUrl, body_document: input.bodyDocument, body_text: input.bodyText, status: 'draft', send_email: false, created_at: now, updated_at: now }], token);
  await post('article_revisions', [{ id: crypto.randomUUID(), article_id: id, editor_user_id: user.id, title: input.title, subtitle: input.subtitle, body_document: input.bodyDocument, body_text: input.bodyText, reason: 'created', created_at: now }], token);
  return { id, slug, status: 'draft', ...input, updatedAt: now };
}

export async function getOwnedArticle(user: AppUser, articleId: string) {
  const rows = await table('articles', { select: ARTICLE_SELECT, id: `eq.${articleId}`, author_user_id: `eq.${user.id}`, limit: '1' }, requireToken(user));
  if (!rows[0]) throw new DomainError('ARTICLE_NOT_FOUND', '没有找到这篇文章。', 404);
  return mapOwned(rows[0]);
}
export async function updateDraft(user: AppUser, articleId: string, input: DraftInput) {
  requireActive(user); const article = await getOwnedArticle(user, articleId);
  if (article.status === 'removed') throw new DomainError('ARTICLE_REMOVED', '这篇文章已被移除，无法编辑。', 403);
  const now = Date.now(); const token = requireToken(user);
  await patch('articles', { id: `eq.${articleId}`, author_user_id: `eq.${user.id}` }, { title: input.title, subtitle: input.subtitle, cover_image_url: input.coverImageUrl, body_document: input.bodyDocument, body_text: input.bodyText, updated_at: now }, token);
  await post('article_revisions', [{ id: crypto.randomUUID(), article_id: articleId, editor_user_id: user.id, title: input.title, subtitle: input.subtitle, body_document: input.bodyDocument, body_text: input.bodyText, reason: 'autosave', created_at: now }], token);
  return { id: articleId, ...input, status: article.status, updatedAt: now };
}
export async function publishArticle(user: AppUser, articleId: string) {
  requireActive(user);
  if (user.identityStatus !== 'verified') throw new DomainError('IDENTITY_REQUIRED', '公开发布前需要完成实名验证。文章已经安全保存在草稿中。', 403);
  const article = await getOwnedArticle(user, articleId);
  if (!article.coverImageUrl.trim()) throw new DomainError('COVER_IMAGE_REQUIRED', '发布前请为文章添加一张封面图。');
  if (article.bodyText.trim().length < 50) throw new DomainError('ARTICLE_TOO_SHORT', '文章正文至少需要 50 个字符。');
  const now = Date.now(); const slug = makeSlug(article.title, articleId);
  await rdbRpc('publish_article', { article_id_input: articleId, slug_input: slug, published_at_input: now }, requireToken(user));
  return { id: articleId, slug, status: 'published', publishedAt: now };
}

export async function setSubscription(user: AppUser, input: { publicationId: string; active: boolean; emailDelivery: boolean }) {
  requireActive(user); const token = requireToken(user);
  const pubs = await table('publications', { select: 'id', id: `eq.${input.publicationId}`, limit: '1' }, token);
  if (!pubs[0]) throw new DomainError('PUBLICATION_NOT_FOUND', '没有找到这个刊物。', 404);
  const now = Date.now();
  await rdbRequest('/subscriptions?on_conflict=subscriber_user_id,publication_id', { method: 'POST', token, headers: { prefer: 'resolution=merge-duplicates,return=representation' }, body: [{ id: crypto.randomUUID(), subscriber_user_id: user.id, publication_id: input.publicationId, status: input.active ? 'active' : 'unsubscribed', email_delivery: input.emailDelivery, created_at: now, updated_at: now }] });
  return { ...input, updatedAt: now };
}

export async function createNewsletterSubscriber(email: string) {
  const secret = process.env.NEWSLETTER_SIGNUP_SECRET;
  if (!secret) throw new Error('Newsletter signup secret is required.');

  const rows = await rdbRpc<Array<{ subscriber_id: string; subscriber_status: string }>>(
    'subscribe_newsletter',
    { email_input: normalizeEmail(email), secret_input: secret },
  );
  const row = rows[0];
  if (!row) throw new Error('Newsletter subscription did not return a result.');
  return { id: row.subscriber_id, status: 'pending' as const };
}

export async function getInbox(user: AppUser, limit = 30) {
  const token = requireToken(user);
  const subs = await table('subscriptions', { select: 'publication_id', subscriber_user_id: `eq.${user.id}`, status: 'eq.active' }, token);
  const ids = subs.map((row) => str(row.publication_id)).filter(Boolean); if (!ids.length) return [];
  const rows = await table('articles', { select: ARTICLE_SELECT, publication_id: `in.(${ids.join(',')})`, status: 'eq.published', order: 'published_at.desc', limit: String(Math.max(1, Math.min(limit, 50))) }, token);
  return rows.map(mapFeed);
}
export async function getDiscoverArticles(limit = 50) {
  const rows = await table('articles', { select: ARTICLE_SELECT, status: 'eq.published', order: 'published_at.desc', limit: String(Math.max(1, Math.min(limit, 100))) });
  return rows.map(mapFeed);
}
export async function getSubscriptions(user: AppUser) {
  const rows = await table('subscriptions', { select: 'publication:publications!subscriptions_publication_id_fkey(id,name,handle,owner:users!publications_owner_user_id_fkey(display_name),articles(id,status))', subscriber_user_id: `eq.${user.id}`, status: 'eq.active', order: 'updated_at.desc' }, requireToken(user));
  return rows.map((row) => { const pub = relation(row.publication); const owner = relation(pub.owner); const articles = Array.isArray(pub.articles) ? pub.articles as Row[] : []; return { publicationId: str(pub.id), name: str(pub.name), handle: str(pub.handle), authorName: str(owner.display_name), articleCount: articles.filter((item) => item.status === 'published').length }; });
}
export async function getPublicArticle(publicationHandle: string, slug: string) {
  const rows = await table('articles', { select: ARTICLE_SELECT, slug: `eq.${slug}`, status: 'eq.published', 'publication.handle': `eq.${publicationHandle}`, limit: '1' });
  return rows[0] ? mapPublished(rows[0]) : null;
}

export async function getPublicProfile(publicationHandle: string) {
  const publications = await table('publications', {
    select: 'id,name,handle,description,owner:users!publications_owner_user_id_fkey(display_name,avatar_url,bio)',
    handle: `eq.${publicationHandle}`,
    status: 'eq.active',
    limit: '1',
  });
  const publication = publications[0];
  if (!publication) return null;
  const owner = relation(publication.owner);
  const articles = await table('articles', {
    select: ARTICLE_SELECT,
    publication_id: `eq.${str(publication.id)}`,
    status: 'eq.published',
    order: 'published_at.desc',
    limit: '50',
  });
  return {
    profile: {
      displayName: str(owner.display_name),
      avatarUrl: str(owner.avatar_url),
      bio: str(owner.bio),
      publicationName: str(publication.name),
      publicationHandle: str(publication.handle),
      publicationDescription: str(publication.description),
    },
    articles: articles.map(mapFeed),
  };
}

async function ownedPublication(user: AppUser) {
  const rows = await table('publications', { select: 'id,name,handle,status', owner_user_id: `eq.${user.id}`, limit: '1' }, requireToken(user));
  if (!rows[0]) throw new DomainError('PUBLICATION_REQUIRED', '请先创建你的刊物。', 409);
  return { id: str(rows[0].id), name: str(rows[0].name), handle: str(rows[0].handle), status: str(rows[0].status) };
}
function table(name: string, values: Record<string, string>, token?: string) { return rdbTable<Row>(name, query(values), token); }
function post(name: string, body: unknown[], token: string) { return rdbRequest<Row[]>(`/${name}`, { method: 'POST', body, token, returnRepresentation: true }); }
function patch(name: string, filters: Record<string, string>, body: Row, token: string) { return rdbRequest<Row[]>(`/${name}?${query(filters)}`, { method: 'PATCH', body, token, returnRepresentation: true }); }
function query(values: Record<string, string>) { const params = new URLSearchParams(); for (const [key, value] of Object.entries(values)) params.set(key, value); return params.toString(); }
function relation(value: unknown): Row { if (Array.isArray(value)) return (value[0] as Row | undefined) ?? {}; return value && typeof value === 'object' ? value as Row : {}; }
function mapUser(row: Row): AppUser { return { id: str(row.id), email: str(row.email_normalized), displayName: str(row.display_name), accountStatus: str(row.account_status), identityStatus: str(row.identity_status) }; }
function mapPublication(row: Row) { return { id: str(row.id), name: str(row.name), handle: str(row.handle), description: str(row.description), status: str(row.status), createdAt: num(row.created_at), updatedAt: num(row.updated_at) }; }
function mapSummary(row: Row) { return { id: str(row.id), title: str(row.title), subtitle: str(row.subtitle), coverImageUrl: str(row.cover_image_url), status: str(row.status), updatedAt: num(row.updated_at), publishedAt: nullableNum(row.published_at) }; }
function mapFeed(row: Row) { const pub = relation(row.publication); const author = relation(row.author); return { id: str(row.id), articleId: str(row.id), slug: str(row.slug), title: str(row.title), subtitle: str(row.subtitle), coverImageUrl: str(row.cover_image_url), bodyText: str(row.body_text), publishedAt: num(row.published_at), publicationId: str(pub.id), publicationName: str(pub.name), publicationHandle: str(pub.handle), authorName: str(author.display_name), authorAvatar: str(author.avatar_url) }; }
function mapOwned(row: Row) { const pub = relation(row.publication); return { ...mapSummary(row), slug: str(row.slug), bodyDocument: str(row.body_document), bodyText: str(row.body_text), sendEmail: Boolean(row.send_email), publicationName: str(pub.name), publicationHandle: str(pub.handle) }; }
function mapPublished(row: Row): PublishedArticle { const pub = relation(row.publication); const author = relation(row.author); return { id: str(row.id), slug: str(row.slug), title: str(row.title), subtitle: str(row.subtitle), bodyDocument: str(row.body_document), bodyText: str(row.body_text), coverImageUrl: str(row.cover_image_url), publishedAt: num(row.published_at), publicationName: str(pub.name), publicationHandle: str(pub.handle), publicationDescription: str(pub.description), authorName: str(author.display_name), authorAvatar: str(author.avatar_url) }; }
function requireToken(user: AppUser) { if (!user.accessToken) throw new DomainError('AUTH_REQUIRED', '请先登录。', 401); return user.accessToken; }
function requireActive(user: AppUser) { if (user.accountStatus !== 'active') throw new DomainError('ACCOUNT_RESTRICTED', '当前账号不能执行这个操作。', 403); }
function isUniqueError(error: unknown) { return error instanceof Error && /unique|constraint|duplicate/i.test(error.message); }
function str(value: unknown) { return typeof value === 'string' ? value : ''; }
function num(value: unknown) { return typeof value === 'number' ? value : Number(value) || 0; }
function nullableNum(value: unknown) { return value == null ? null : num(value); }
function makeSlug(title: string, articleId: string) { const ascii = title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 48); return `${ascii || 'article'}-${articleId.slice(0, 8)}`; }
