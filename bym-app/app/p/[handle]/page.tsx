import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { appPath } from '@/lib/app-path';
import { catalogArticles, type CatalogArticle } from '@/lib/demo-content';
import type { LicensedEssay } from '@/lib/licensed-essay-catalog';

type PageProps = { params: Promise<{ handle: string }> };
function isLicensedEssay(article: CatalogArticle): article is LicensedEssay {
  return 'originalTitle' in article;
}

export default async function PublicationPage({ params }: PageProps) {
  const { handle } = await params;
  const articles = (Object.values(catalogArticles) as CatalogArticle[]).filter((article) => article.handle === handle);
  const lead = articles[0];
  if (!lead) notFound();

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
          {lead.authorAvatar ? (
            <img src={lead.authorAvatar} alt={`${lead.author}的头像`} className="mx-auto size-20 rounded-full object-cover ring-1 ring-border" />
          ) : (
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-secondary font-serif-cn text-2xl text-muted-foreground ring-1 ring-border">{lead.author.slice(0, 1)}</div>
          )}
          <h1 className="mt-5 font-serif-cn text-4xl font-semibold tracking-tight">{lead.publication}</h1>
          <p className="mt-2 text-sm text-muted-foreground">由 {lead.author} 写作</p>
          {isLicensedEssay(lead) && <p className="mt-2 text-xs text-muted-foreground">经授权收录 · 作者资料未认领</p>}
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">{lead.subtitle}</p>
          <button className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">订阅这个刊物</button>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold tracking-[0.13em] text-muted-foreground">最新文章</h2>
          <div className="mt-3 divide-y divide-border">
            {articles.map((article) => (
              <a href={appPath(`/article/${article.slug}`)} key={article.slug} className="group grid gap-5 py-7 sm:grid-cols-[1fr_180px] sm:items-center">
                <div>
                  <p className="text-xs text-muted-foreground">{article.published} · {article.readingTime}</p>
                  <h3 className="mt-2 font-serif-cn text-2xl font-semibold group-hover:text-accent-foreground">{article.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{article.subtitle}</p>
                </div>
                <img src={article.coverImage} alt={article.coverAlt} className="aspect-[3/2] w-full rounded-md object-cover" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
