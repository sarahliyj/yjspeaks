import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bookmark, Share2, Type } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { appPath } from '@/lib/app-path';
import { getPublicArticle } from '@/db/repository';

type PageProps = { params: Promise<{ handle: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle, slug } = await params;
  const article = await getPublicArticle(handle, slug);
  if (!article) return { title: '文章未找到 · 笔姆' };
  return {
    title: `${article.title} · ${article.publicationName}`,
    description: article.subtitle || article.bodyText.slice(0, 120),
  };
}

export default async function PublicationArticlePage({ params }: PageProps) {
  const { handle, slug } = await params;
  const article = await getPublicArticle(handle, slug);
  if (!article) notFound();

  const paragraphs = article.bodyText
    .split(/\n+/)
    .map((paragraph: string) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <a href={appPath('/inbox')} className="icon-button" aria-label="返回收件箱"><ArrowLeft className="size-[18px]" /></a>
          <a href={appPath('/')} className="ml-3" aria-label="Bym 笔姆首页"><BrandLogo className="h-6 w-auto" /></a>
          <div className="ml-auto flex items-center gap-1">
            <button className="icon-button" aria-label="调整字号"><Type className="size-[17px]" /></button>
            <button className="icon-button" aria-label="收藏文章"><Bookmark className="size-[17px]" /></button>
            <button className="icon-button" aria-label="分享文章"><Share2 className="size-[17px]" /></button>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-[720px] px-6 pb-24 pt-14 sm:pt-20">
        <a href={appPath(`/p/${article.publicationHandle}`)} className="text-xs font-semibold tracking-[0.14em] text-accent-foreground hover:underline">{article.publicationName}</a>
        <h1 className="mt-5 font-serif-cn text-[2.35rem] font-semibold leading-[1.22] tracking-[-0.035em] sm:text-[3.65rem]">{article.title}</h1>
        {article.subtitle && <p className="mt-5 text-lg leading-8 text-muted-foreground sm:text-xl">{article.subtitle}</p>}

        {article.coverImageUrl && (
          <figure className="mt-9 overflow-hidden rounded-lg bg-secondary">
            <img src={article.coverImageUrl} alt={`《${article.title}》封面`} className="aspect-[3/2] w-full object-cover" />
          </figure>
        )}

        <div className="mt-9 flex items-center gap-3 border-b border-border pb-8">
          {article.authorAvatar ? (
            <img src={article.authorAvatar} alt={`${article.authorName}的头像`} className="size-11 rounded-full object-cover ring-1 ring-border" />
          ) : (
            <span className="grid size-11 place-items-center rounded-full bg-secondary font-serif-cn font-semibold text-accent-foreground">{article.authorName.slice(0, 1)}</span>
          )}
          <div>
            <a href={appPath(`/p/${article.publicationHandle}`)} className="text-sm font-medium hover:underline">{article.authorName}</a>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
          </div>
        </div>

        <div className="mt-10 space-y-7 font-serif-cn text-[18px] leading-[1.9] tracking-[0.005em] sm:text-[20px]">
          {(paragraphs.length ? paragraphs : ['']).map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)}
        </div>
      </article>
    </main>
  );
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}
