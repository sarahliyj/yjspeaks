import { ArrowLeft, Bookmark } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { appPath } from '@/lib/app-path';

export default function SavedPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-5 sm:px-8">
          <a href={appPath('/')} className="icon-button" aria-label="返回收件箱"><ArrowLeft className="size-[18px]" /></a>
          <a href={appPath('/')} className="mx-auto" aria-label="Bym 笔姆首页"><BrandLogo className="h-6 w-auto" /></a>
          <div className="size-8" />
        </div>
      </header>
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.13em] text-muted-foreground">你的书架</p>
        <h1 className="mt-2 font-serif-cn text-4xl font-semibold">稍后阅读</h1>
        <div className="mt-10 rounded-lg border border-dashed border-[#9cc9ef] bg-[#f8fbff] px-6 py-14 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-md bg-secondary text-muted-foreground"><Bookmark className="size-5" /></span>
          <h2 className="mt-4 font-serif-cn text-xl font-semibold">还没有收藏文章</h2>
          <p className="mt-2 text-sm text-muted-foreground">看到想留到以后慢慢读的内容，就点一下收藏。</p>
          <a href={appPath('/')} className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">去发现文章</a>
        </div>
      </section>
    </main>
  );
}
