import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bookmark, Share2, Type } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { appPath } from '@/lib/app-path';
import { demoArticles, type DemoArticleSlug } from '@/lib/demo-content';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = demoArticles[slug as DemoArticleSlug];
  if (!article) return { title: '文章未找到 · 笔姆' };

  return {
    title: `${article.title} · ${article.publication}`,
    description: article.subtitle,
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: 'article',
      images: [{ url: article.coverImage, alt: article.coverAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.subtitle,
      images: [article.coverImage],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = demoArticles[slug as DemoArticleSlug];
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <a href={appPath('/')} className="icon-button" aria-label="返回收件箱"><ArrowLeft className="size-[18px]" /></a>
          <a href={appPath('/')} className="ml-3" aria-label="Bym 笔姆首页"><BrandLogo className="h-6 w-auto" /></a>
          <div className="ml-auto flex items-center gap-1">
            <button className="icon-button" aria-label="调整字号"><Type className="size-[17px]" /></button>
            <button className="icon-button" aria-label="收藏文章"><Bookmark className="size-[17px]" /></button>
            <button className="icon-button" aria-label="分享文章"><Share2 className="size-[17px]" /></button>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-[720px] px-6 pb-24 pt-14 sm:pt-20">
        <a href={`/p/${article.handle}`} className="text-xs font-semibold tracking-[0.14em] text-accent-foreground hover:underline">{article.publication}</a>
        <h1 className="mt-5 font-serif-cn text-[2.35rem] font-semibold leading-[1.22] tracking-[-0.035em] sm:text-[3.65rem]">{article.title}</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground sm:text-xl">{article.subtitle}</p>

        <figure className="mt-9 overflow-hidden rounded-lg bg-secondary">
          <img src={article.coverImage} alt={article.coverAlt} className="aspect-[3/2] w-full object-cover" />
          <figcaption className="px-1 pt-2 text-[11px] text-muted-foreground">
            Photo: <a href={article.photoSource} target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">{article.photoCredit}</a>
          </figcaption>
        </figure>

        <div className="mt-9 flex items-center gap-3 border-b border-border pb-8">
          <img src={article.authorAvatar} alt={`${article.author}的头像`} className="size-11 rounded-full object-cover ring-1 ring-border" />
          <div>
            <p className="text-sm font-medium">{article.author}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{article.published} · {article.readingTime}</p>
          </div>
          <button className="ml-auto rounded-md border border-primary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">订阅</button>
        </div>

        <div className="mt-10 space-y-7 font-serif-cn text-[18px] leading-[1.9] tracking-[0.005em] sm:text-[20px]">
          {article.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

      </article>
    </main>
  );
}
