import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { appPath } from '@/lib/app-path';
import { catalogArticles, type CatalogArticle } from '@/lib/demo-content';
import type { LicensedEssay } from '@/lib/licensed-essay-catalog';
import { getPublicProfile } from '@/db/repository';

type PageProps = { params: Promise<{ handle: string }> };
function isLicensedEssay(article: CatalogArticle): article is LicensedEssay {
  return 'originalTitle' in article;
}

export default async function PublicationPage({ params }: PageProps) {
  const { handle } = await params;
  const catalogueArticles = (Object.values(catalogArticles) as CatalogArticle[]).filter((article) => article.handle === handle);
  const databaseProfile = catalogueArticles.length ? null : await getPublicProfile(handle);
  if (!catalogueArticles.length && !databaseProfile) notFound();

  const lead = catalogueArticles[0];
  const profile = lead
    ? {
        displayName: lead.author,
        avatarUrl: lead.authorAvatar,
        publicationName: lead.publication,
        description: lead.subtitle,
        imported: isLicensedEssay(lead),
      }
    : {
        displayName: databaseProfile!.profile.displayName,
        avatarUrl: databaseProfile!.profile.avatarUrl,
        publicationName: databaseProfile!.profile.publicationName,
        description: databaseProfile!.profile.bio || databaseProfile!.profile.publicationDescription,
        imported: false,
      };
  const articles = lead
    ? catalogueArticles.map((article) => ({
        id: article.slug,
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        published: article.published,
        coverImage: article.coverImage,
        href: appPath(`/article/${article.slug}`),
      }))
    : databaseProfile!.articles.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        published: formatDate(article.publishedAt),
        coverImage: article.coverImageUrl,
        href: appPath(`/p/${handle}/${article.slug}`),
      }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-5 sm:px-8">
          <a href={appPath('/')} className="icon-button" aria-label="返回收件箱"><ArrowLeft className="size-[18px]" /></a>
          <a href={appPath('/')} className="mx-auto" aria-label="Bym 笔姆首页"><BrandLogo className="h-6 w-auto" /></a>
          <div className="size-8" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
        <section className="border-b border-border pb-10 text-center">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`${profile.displayName}的头像`} className="mx-auto size-20 rounded-full object-cover ring-1 ring-border" />
          ) : (
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-secondary font-serif-cn text-2xl text-muted-foreground ring-1 ring-border">{profile.displayName.slice(0, 1)}</div>
          )}
          <h1 className="mt-5 font-serif-cn text-4xl font-semibold tracking-tight">{profile.displayName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{profile.publicationName}</p>
          {profile.imported && <p className="mt-2 text-xs text-muted-foreground">经授权收录 · 作者资料未认领</p>}
          {profile.description && <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">{profile.description}</p>}
          <a href={appPath('/login')} className="mt-6 inline-flex rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">登录后订阅</a>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold tracking-[0.13em] text-muted-foreground">最新文章</h2>
          <div className="mt-3 divide-y divide-border">
            {articles.map((article) => (
              <a href={article.href} key={article.id} className="group grid gap-5 py-7 sm:grid-cols-[1fr_180px] sm:items-center">
                <div>
                  <p className="text-xs text-muted-foreground">{article.published}</p>
                  <h3 className="mt-2 font-serif-cn text-2xl font-semibold group-hover:text-accent-foreground">{article.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{article.subtitle}</p>
                </div>
                {article.coverImage && <img src={article.coverImage} alt={`《${article.title}》封面`} className="aspect-[3/2] w-full rounded-md object-cover" />}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}
