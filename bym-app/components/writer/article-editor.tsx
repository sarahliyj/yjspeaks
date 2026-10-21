'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Eye, ImageIcon, LoaderCircle, MoreHorizontal, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/cloudbase-client';
import { appPath } from '@/lib/app-path';

type Article = {
  id: string;
  title: string;
  subtitle: string;
  coverImageUrl: string;
  bodyText: string;
  status: string;
  publicationName: string;
  publicationHandle: string;
};

export function ArticleEditor({ article }: { article: Article }) {
  const [title, setTitle] = useState(article.title === '无标题' ? '' : article.title);
  const [subtitle, setSubtitle] = useState(article.subtitle);
  const [coverImageUrl, setCoverImageUrl] = useState(article.coverImageUrl);
  const [body, setBody] = useState(article.bodyText);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState('');
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    setSaveState('saving');
    const timeout = window.setTimeout(async () => {
      try {
        const response = await authFetch(`/api/articles/${article.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            title: title || '无标题',
            subtitle,
            coverImageUrl,
            bodyText: body,
            bodyDocument: toDocument(body),
          }),
        });
        if (!response.ok) throw new Error('保存失败');
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [article.id, body, coverImageUrl, subtitle, title]);

  async function publish() {
    setPublishing(true);
    setNotice('');
    try {
      const response = await authFetch(`/api/articles/${article.id}/publish`, { method: 'POST' });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? '发布失败');
      setNotice('文章已发布。');
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : '发布失败');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <a href={appPath('/write')} className="icon-button" aria-label="返回写作者工作台"><ArrowLeft className="size-[18px]" /></a>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{article.publicationName}</p>
            <p className={`mt-0.5 flex items-center gap-1 text-[11px] ${saveState === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
              {saveState === 'saving' ? <LoaderCircle className="size-3 animate-spin" /> : <Check className="size-3" />}
              {saveState === 'saving' ? '正在保存' : saveState === 'error' ? '保存失败，将自动重试' : '所有更改已保存'}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
              className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Eye className="size-4" />
              <span className="hidden sm:inline">{mode === 'edit' ? '预览' : '继续编辑'}</span>
            </button>
            <button className="icon-button" aria-label="更多文章设置"><MoreHorizontal className="size-[18px]" /></button>
            <Button className="h-9 rounded-md px-4 font-semibold" onClick={publish} disabled={publishing || saveState === 'saving'}>
              {publishing ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
              发布
            </Button>
          </div>
        </div>
      </header>

      {notice && (
        <div className="fixed right-5 top-20 z-40 max-w-sm rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-xl">
          {notice}
        </div>
      )}

      <main className="mx-auto max-w-[900px] px-3 py-6 sm:px-6 sm:py-10">
        <div className="min-h-[calc(100vh-9rem)] rounded-lg border border-border bg-card/70 px-6 py-10 shadow-[0_18px_60px_rgb(0_0_0/22%)] sm:px-16 sm:py-16 md:px-24">
          {mode === 'edit' ? (
            <div>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="文章标题"
                maxLength={120}
                className="w-full border-0 bg-transparent font-serif-cn text-3xl font-bold leading-tight tracking-[-0.03em] outline-none placeholder:text-[#8da2b8] sm:text-5xl"
              />
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="添加副标题（可选）"
                maxLength={240}
                className="mt-5 w-full border-0 bg-transparent text-base leading-7 text-muted-foreground outline-none placeholder:text-[#8da2b8] sm:text-lg"
              />
              <label className="mt-7 block rounded-lg border border-dashed border-border bg-secondary/35 p-4">
                <span className="flex items-center gap-2 text-sm font-medium"><ImageIcon className="size-4" />文章封面图</span>
                <span className="mt-1 block text-xs text-muted-foreground">每篇文章都需要一张横向主图。现在可粘贴图片地址，上传功能会接入作者账号。</span>
                <input value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} placeholder="https://…" className="mt-3 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
                {coverImageUrl && <img src={coverImageUrl} alt="文章封面预览" className="mt-4 aspect-[3/2] w-full rounded-md object-cover" />}
              </label>
              <div className="my-8 h-px bg-border/80" />
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder={'进入专注。\n\n把这件事完整地写下来。'}
                className="min-h-[55vh] w-full resize-none border-0 bg-transparent font-serif-cn text-[17px] leading-[1.9] outline-none placeholder:text-[#8da2b8] sm:text-[19px]"
              />
            </div>
          ) : (
            <article>
              <p className="mb-5 text-xs font-semibold tracking-[0.14em] text-accent-foreground">{article.publicationName}</p>
              <h1 className="font-serif-cn text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">{title || '无标题'}</h1>
              {subtitle && <p className="mt-5 text-lg leading-8 text-muted-foreground">{subtitle}</p>}
              {coverImageUrl && <img src={coverImageUrl} alt="文章封面" className="mt-8 aspect-[3/2] w-full rounded-lg object-cover" />}
              <div className="my-9 h-px bg-border" />
              <div className="space-y-6 font-serif-cn text-[17px] leading-[1.9] sm:text-[19px]">
                {body ? body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p className="text-muted-foreground">正文会在这里显示。</p>}
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}

function toDocument(body: string) {
  return JSON.stringify({
    type: 'doc',
    content: body
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] })),
  });
}
