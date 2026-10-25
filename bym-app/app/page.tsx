'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  ChevronRight,
  Ellipsis,
  Feather,
  Heart,
  House,
  Inbox,
  MessageCircle,
  Repeat2,
  Search,
  Share2,
  Settings,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { InviteFriend } from '@/components/invite-friend';
import { authFetch } from '@/lib/cloudbase-client';
import { appPath } from '@/lib/app-path';
import { catalogArticles } from '@/lib/demo-content';

type SessionUser = {
  displayName: string;
  email: string;
};

type Subscription = {
  publicationId: string;
  name: string;
  handle: string;
  authorName: string;
  articleCount: number;
};

type InboxArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImageUrl: string;
  bodyText: string;
  publishedAt: number;
  publicationName: string;
  publicationHandle: string;
  authorName: string;
  authorAvatar: string;
};

type FeedArticle = InboxArticle & {
  publicationId?: string;
  href: string;
};

const themes = ['全部', '科技', '逻辑与思辨', '教育', '科学', '世界政治', '哲学', '社会议题', '自我成长', '心理与脑科学', '健康', '旅行', '历史', '财经'];

const topicKeywords: Record<string, string[]> = {
  科技: ['科技', '技术', 'ai', '人工智能', '软件', '互联网', '工具'],
  逻辑与思辨: ['逻辑', '思辨', '选择', '意义', '正确', '观点', '判断'],
  教育: ['教育', '学习', '学校', '课堂', '学生', '老师'],
  科学: ['科学', '研究', '实验', '物理', '化学', '生物'],
  世界政治: ['政治', '政策', '国际', '国家', '战争', '外交'],
  哲学: ['哲学', '生命', '爱', '存在', '自由', '伦理'],
  社会议题: ['社会', '城市', '性别', '阶层', '劳动', '公共'],
  自我成长: ['成长', '习惯', '专注', '注意力', '人生', '自己'],
  心理与脑科学: ['心理', '大脑', '情绪', '焦虑', '认知', '神经'],
  健康: ['健康', '医疗', '运动', '睡眠', '饮食'],
  旅行: ['旅行', '旅途', '城市', '街道', '远方'],
  历史: ['历史', '年代', '古代', '过去', '世纪'],
  财经: ['财经', '金融', '商业', '经济', '投资', '公司'],
};

const sampleFeed: FeedArticle[] = Object.values(catalogArticles).map((article) => ({
  id: `sample-${article.slug}`,
  slug: article.slug,
  title: article.title,
  subtitle: article.subtitle,
  bodyText: article.paragraphs.join(' '),
  coverImageUrl: article.coverImage,
  publishedAt: parseChineseDate(article.published),
  publicationName: article.publication,
  publicationHandle: article.handle,
  authorName: article.author,
  authorAvatar: article.authorAvatar,
  href: appPath(`/article/${article.slug}`),
}));

export function FeedPage({ view = 'home' }: { view?: 'home' | 'inbox' }) {
  const isInbox = view === 'inbox';
  const [session, setSession] = useState<'loading' | 'authenticated' | 'anonymous'>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionArticles, setSubscriptionArticles] = useState<InboxArticle[]>([]);
  const [discoverArticles, setDiscoverArticles] = useState<FeedArticle[]>(sampleFeed);
  const [activeTheme, setActiveTheme] = useState('全部');

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const meResponse = await authFetch('/api/session', { cache: 'no-store' });
        if (!meResponse.ok) throw new Error('AUTH_REQUIRED');
        const me = (await meResponse.json()) as { user: SessionUser };
        const [inboxResponse, subscriptionsResponse] = await Promise.all([
          authFetch('/api/inbox'),
          authFetch('/api/subscriptions'),
        ]);
        if (!active) return;
        setUser(me.user);
        setSession('authenticated');
        if (inboxResponse.ok) {
          const payload = (await inboxResponse.json()) as { items?: InboxArticle[] };
          setSubscriptionArticles(payload.items ?? []);
        }
        if (subscriptionsResponse.ok) {
          const payload = (await subscriptionsResponse.json()) as { subscriptions?: Subscription[] };
          setSubscriptions(payload.subscriptions ?? []);
        }
      } catch {
        if (!active) return;
        setSession('anonymous');
        setUser(null);
        setSubscriptions([]);
        setSubscriptionArticles([]);
      }
    }

    void loadAccount();
    fetch(appPath(`/api/discover?limit=50&t=${Date.now()}`), { cache: 'no-store' })
      .then(async (response) => response.ok ? await response.json() as { articles?: InboxArticle[] } : Promise.reject())
      .then((payload) => {
        if (!active || !Array.isArray(payload.articles)) return;
        setDiscoverArticles([
          ...payload.articles.map((article) => ({ ...article, href: appPath(`/p/${article.publicationHandle}/${article.slug}`) })),
          ...sampleFeed,
        ]);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const homeArticles = useMemo(
    () => activeTheme === '全部' ? discoverArticles : discoverArticles.filter((article) => inferTheme(article) === activeTheme),
    [activeTheme, discoverArticles],
  );

  const visibleItems = isInbox
    ? subscriptionArticles.map((item) => ({
        id: item.id,
        slug: item.slug,
        handle: item.publicationHandle,
        author: item.authorName,
        initials: item.authorName.slice(0, 1),
        avatar: item.authorAvatar,
        coverImage: item.coverImageUrl,
        coverAlt: `《${item.title}》封面`,
        publication: item.publicationName,
        title: item.title,
        excerpt: item.subtitle || item.bodyText,
        meta: formatPublishedAt(item.publishedAt),
        tone: 'ink',
        href: appPath(`/p/${item.publicationHandle}/${item.slug}`),
      }))
    : homeArticles.map((item) => ({
        id: item.id,
        slug: item.slug,
        handle: item.publicationHandle,
        author: item.authorName,
        initials: item.authorName.slice(0, 1),
        avatar: item.authorAvatar,
        coverImage: directImage(item.coverImageUrl) ? item.coverImageUrl : '',
        coverAlt: `《${item.title}》封面`,
        publication: item.publicationName,
        title: item.title,
        excerpt: item.subtitle || item.bodyText,
        meta: formatPublishedAt(item.publishedAt),
        tone: 'ink',
        href: item.href,
      }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-5 px-5 lg:px-8">
          <a href={appPath('/')} className="flex shrink-0 items-center" aria-label="Bym 笔姆首页">
            <BrandLogo />
          </a>

          <div className="mx-auto hidden w-full max-w-md items-center rounded-md border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground md:flex">
            <Search className="mr-2.5 size-4" />
            <span>搜索文章、作者或刊物</span>
            <kbd className="ml-auto rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘ K</kbd>
          </div>

          <nav className="ml-auto flex items-center gap-2" aria-label="主要导航">
            <button className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden" aria-label="搜索">
              <Search className="size-[18px]" />
            </button>
            <a
              href={appPath('/write')}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#238fe8]"
            >
              <Feather className="size-4" />
              <span className="hidden sm:inline">写文章</span>
            </a>
            <a
              href={appPath(session === 'authenticated' ? '/profile' : '/login')}
              className="grid size-9 place-items-center rounded-md bg-[#e5f2ff] font-serif-cn text-sm font-semibold text-[#1768ad]"
              aria-label={session === 'authenticated' ? `${user?.displayName || user?.email}的账号` : '登录或创建账号'}
            >
              {session === 'authenticated' ? (user?.displayName || user?.email || '我').slice(0, 1) : '登录'}
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[220px_minmax(0,720px)_260px] lg:gap-10 lg:px-8">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r border-border/70 py-8 pr-7 lg:flex lg:flex-col">
          <nav className="space-y-1" aria-label="阅读导航">
            <a className={`nav-item ${!isInbox ? 'bg-secondary text-foreground' : ''}`} href={appPath('/')}>
              <House className="size-[18px]" />
              首页
            </a>
            <a className={`nav-item ${isInbox ? 'bg-secondary text-foreground' : ''}`} href={appPath('/inbox')}>
              <Inbox className="size-[18px]" />
              收件箱
              {session === 'authenticated' && subscriptionArticles.length > 0 && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">{subscriptionArticles.length}</span>
              )}
            </a>
            <a className="nav-item" href={appPath('/saved')}><Bookmark className="size-[18px]" />稍后阅读</a>
          </nav>

          <div className="mt-9">
            <div className="mb-3 flex items-center justify-between px-3 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
              <span>我的订阅</span>
              <span>{subscriptions.length}</span>
            </div>
            <div className="space-y-1">
              {subscriptions.map(({ name, articleCount, handle }, index) => (
                <a href={appPath(`/p/${handle}`)} className="nav-item py-2" key={name}>
                  <span className={`size-2 rounded-full ${index === 0 ? 'bg-[#2c9fff]' : index === 1 ? 'bg-[#5a85ff]' : index === 2 ? 'bg-[#33c1ff]' : 'bg-[#7186a4]'}`} />
                  <span className="truncate">{name}</span>
                  {articleCount > 0 && <span className="ml-auto text-xs text-muted-foreground">{articleCount}</span>}
                </a>
              ))}
            </div>
          </div>

          <a href={appPath('/settings')} className="nav-item mt-auto"><Settings className="size-[18px]" />设置</a>
        </aside>

        <section className="min-w-0 border-border/70 px-5 py-8 sm:px-8 lg:border-r lg:px-0 lg:pr-10 lg:py-11">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="mb-2 text-xs font-medium tracking-[0.13em] text-muted-foreground">{formatToday()}</p>
              <h1 className="font-serif-cn text-[2rem] font-semibold leading-tight tracking-[-0.025em] sm:text-[2.3rem]">{isInbox ? '收件箱' : '首页'}</h1>
            </div>
            {isInbox && visibleItems.length > 0 && (
              <button className="mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                <Check className="size-3.5" />
                全部已读
              </button>
            )}
          </div>

          {!isInbox && (
            <nav className="-mx-5 mb-6 overflow-x-auto border-y border-border px-5 py-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0" aria-label="首页主题">
              <div className="flex w-max gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setActiveTheme(theme)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTheme === theme ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {(!isInbox || visibleItems.length > 0) && (
          <div className="feed-stream">
            {visibleItems.map((item) => {
              const articleHref = item.href;
              return (
              <article
                key={item.id}
                className="feed-post group"
              >
                <div className="flex items-center gap-3">
                  {item.avatar ? (
                    <img src={item.avatar} alt={`${item.author}的头像`} className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border" />
                  ) : (
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary font-serif-cn font-semibold text-accent-foreground">{item.initials}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2 text-[15px]">
                      <a href={appPath(`/p/${item.handle}`)} className="truncate font-semibold hover:underline">{item.author}</a>
                      <span className="shrink-0 text-sm text-muted-foreground">{item.meta}</span>
                    </div>
                  </div>
                  {!isInbox && (
                    <a href={appPath(session === 'authenticated' ? `/p/${item.handle}` : '/login')} className="shrink-0 text-sm font-semibold text-primary hover:underline">
                      订阅
                    </a>
                  )}
                  <button className="feed-top-action" aria-label="更多操作"><Ellipsis className="size-[18px]" /></button>
                  <button className="feed-top-action hidden sm:grid" aria-label="不感兴趣"><X className="size-[18px]" /></button>
                </div>

                {item.coverImage ? (
                  <a href={articleHref} className="feed-story-card">
                    <img src={item.coverImage} alt={item.coverAlt} className="feed-story-image" />
                    <div className="feed-story-caption">
                      <p className="truncate text-xs font-medium uppercase tracking-[0.08em] text-white/65">{item.publication}</p>
                      <h2 className="mt-1.5 line-clamp-2 text-[1.15rem] font-semibold leading-snug tracking-[-0.015em] text-white sm:text-[1.3rem]">{item.title}</h2>
                      <Bookmark className="absolute bottom-5 right-5 size-5 text-white/70" />
                    </div>
                  </a>
                ) : (
                  <a href={articleHref} className="mt-4 block pl-14 sm:pl-14">
                    <h2 className="text-[1.15rem] font-semibold leading-snug tracking-[-0.015em] transition-colors group-hover:text-primary sm:text-[1.3rem]">{item.title}</h2>
                    <p className="mt-2 line-clamp-4 text-[15px] leading-7 text-foreground/85">{item.excerpt}</p>
                  </a>
                )}

                <div className="feed-actions">
                  <button aria-label={`喜欢《${item.title}》`}><Heart /></button>
                  <button aria-label={`评论《${item.title}》`}><MessageCircle /></button>
                  <button aria-label={`转发《${item.title}》`}><Repeat2 /></button>
                  <button aria-label={`分享《${item.title}》`}><Share2 /></button>
                  <a href={articleHref} className="ml-auto" aria-label={`阅读《${item.title}》`}><ChevronRight /></a>
                </div>
              </article>
              );
            })}
          </div>
          )}

          {isInbox && session === 'loading' && (
            <div className="rounded-lg border border-border bg-card/45 px-6 py-12 text-center text-sm text-muted-foreground">正在载入…</div>
          )}

          {isInbox && session === 'anonymous' && (
            <div className="rounded-lg border border-dashed border-[#9cc9ef] bg-[#f1f8ff] px-6 py-10 text-center">
              <h2 className="font-serif-cn text-xl font-semibold">登录后查看收件箱</h2>
              <div className="mt-5 flex justify-center gap-2">
                <a href={appPath('/login?returnTo=/inbox')} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">登录</a>
                <a href={appPath('/')} className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-semibold">去订阅</a>
              </div>
            </div>
          )}

          {isInbox && session === 'authenticated' && subscriptions.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#9cc9ef] bg-[#f1f8ff] px-6 py-10 text-center">
              <h2 className="font-serif-cn text-xl font-semibold">还没有订阅</h2>
              <a href={appPath('/')} className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">去订阅</a>
            </div>
          )}

          {isInbox && session === 'authenticated' && subscriptions.length > 0 && subscriptionArticles.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#9cc9ef] bg-[#f1f8ff] px-6 py-10 text-center">
              <h2 className="font-serif-cn text-xl font-semibold">订阅的刊物还没有新文章</h2>
              <a href={appPath('/')} className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-semibold">继续发现</a>
            </div>
          )}

          {isInbox && subscriptionArticles.length > 0 && (
            <div className="mt-6 rounded-lg border border-dashed border-[#9cc9ef] bg-[#f1f8ff] px-6 py-7 text-center">
              <span className="mx-auto grid size-9 place-items-center rounded-md bg-[#dfefff] text-[#1974be]"><Check className="size-4" /></span>
              <p className="mt-3 font-serif-cn text-lg font-semibold">已读完</p>
            </div>
          )}
        </section>

        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] py-11 xl:block">
          {session !== 'authenticated' && (
            <section className="rounded-lg border border-border bg-card/70 p-5">
              <h2 className="font-serif-cn text-xl font-semibold leading-snug">创建账号</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">今天开始写作，也开始阅读。</p>
              <div className="mt-5 grid gap-2">
                <a href={appPath('/login')} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-[#238fe8]">登录</a>
                <a href={appPath('/')} className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-semibold hover:bg-secondary">开始阅读</a>
              </div>
            </section>
          )}

          <section className="mt-4">
            <InviteFriend />
          </section>

          <footer className="absolute bottom-8 text-[11px] leading-6 text-muted-foreground">
            <a href={appPath('/about')} className="mr-3 hover:text-foreground">关于</a>
            <a href={appPath('/guidelines')} className="mr-3 hover:text-foreground">社区规则</a>
            <a href={appPath('/privacy')} className="hover:text-foreground">隐私</a>
            <p>© 2026 笔姆</p>
          </footer>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border bg-background/95 px-5 backdrop-blur-xl lg:hidden" aria-label="移动导航">
        <a href={appPath('/')} className={`mobile-nav-item ${!isInbox ? 'text-foreground' : ''}`}><House className="size-5" /><span>首页</span></a>
        <a href={appPath('/inbox')} className={`mobile-nav-item ${isInbox ? 'text-foreground' : ''}`}><Inbox className="size-5" /><span>收件箱</span></a>
        <a href={appPath('/saved')} className="mobile-nav-item"><Bookmark className="size-5" /><span>稍后阅读</span></a>
      </nav>
    </main>
  );
}

export default function Home() {
  return <FeedPage />;
}

function formatPublishedAt(value: number) {
  if (!value) return '';
  const elapsed = Date.now() - value;
  if (elapsed >= 0 && elapsed < 60 * 60 * 1000) {
    return `${Math.max(1, Math.floor(elapsed / 60_000))}分钟前`;
  }
  if (elapsed >= 0 && elapsed < 24 * 60 * 60 * 1000) {
    return `${Math.floor(elapsed / 3_600_000)}小时前`;
  }
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

function parseChineseDate(value: string) {
  const match = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) return 0;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

function formatToday() {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(now);
  const date = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(now);
  return `${weekday} · ${date}`;
}

function inferTheme(article: FeedArticle) {
  const source = `${article.title} ${article.subtitle} ${article.bodyText}`.toLowerCase();
  return Object.entries(topicKeywords).find(([, words]) => words.some((word) => source.includes(word)))?.[0] ?? '其他';
}

function directImage(url: string) {
  return url.startsWith('/') || /\.(?:avif|gif|jpe?g|png|webp)(?:[?#]|$)/i.test(url);
}
