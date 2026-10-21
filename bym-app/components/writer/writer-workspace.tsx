'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Feather, FileText, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authFetch } from '@/lib/cloudbase-client';
import { appPath } from '@/lib/app-path';

type Publication = {
  id: string;
  name: string;
  handle: string;
  description: string;
  status: string;
};

type Article = {
  id: string;
  title: string;
  subtitle: string;
  coverImageUrl: string;
  status: string;
  updatedAt: number;
  publishedAt: number | null;
};

type Props = {
  publication: Publication | null;
  articles: Article[];
  identityStatus: string;
};

export function WriterWorkspace({ publication: initialPublication, articles, identityStatus }: Props) {
  const router = useRouter();
  const [publication, setPublication] = useState(initialPublication);
  const [workspaceArticles, setWorkspaceArticles] = useState(articles);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function createPublication() {
    setBusy(true);
    setError('');
    try {
      const response = await authFetch('/api/publications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          handle: `p-${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`,
          description: '',
        }),
      });
      const payload = (await response.json()) as {
        publication?: Publication;
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(payload.error?.message ?? '创建失败');
      if (!payload.publication) throw new Error('创建结果不完整');
      setPublication(payload.publication);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '创建失败');
    } finally {
      setBusy(false);
    }
  }

  const createDraft = useCallback(async (input?: { title?: string; subtitle?: string; bodyText?: string }) => {
    const response = await authFetch('/api/articles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: input?.title || '无标题',
          subtitle: input?.subtitle || '',
          coverImageUrl: '',
          bodyDocument: JSON.stringify({
            type: 'doc',
            content: input?.bodyText
              ? [{ type: 'paragraph', content: [{ type: 'text', text: input.bodyText }] }]
              : [],
          }),
          bodyText: input?.bodyText || '',
        }),
      });
    const payload = (await response.json()) as {
      article?: Article;
      error?: { message?: string };
    };
    if (!response.ok) throw new Error(payload.error?.message ?? '无法创建草稿');
    const article = payload.article;
    if (!article) throw new Error('草稿创建结果不完整');
    setWorkspaceArticles((current) => [article, ...current]);
    return article;
  }, []);

  useEffect(() => {
    if (!publication) return;
    const context = getModelContext();
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    void Promise.resolve(
      context.registerTool(
        {
          name: 'create_article_draft',
          title: '创建文章草稿',
          description: '在当前笔姆刊物中创建一篇新的文章草稿，并返回可继续编辑的地址。不会公开发布。',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', maxLength: 120 },
              subtitle: { type: 'string', maxLength: 240 },
              bodyText: { type: 'string', maxLength: 200000 },
            },
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input: unknown) {
            const values = validateDraftToolInput(input);
            const draft = await createDraft(values);
            return { id: draft.id, status: 'draft', editUrl: appPath(`/write/${draft.id}`) };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);

    return () => lifecycle.abort();
  }, [createDraft, publication]);

  async function createArticle() {
    setBusy(true);
    setError('');
    try {
      const article = await createDraft();
      router.push(appPath(`/write/${article.id}`));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '无法创建草稿');
      setBusy(false);
    }
  }

  if (!publication) {
    return (
      <div className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
        <div className="mx-auto max-w-2xl">
          <a href={appPath('/')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> 返回收件箱
          </a>
          <div className="mt-14 rounded-lg border border-border bg-card/70 p-6 shadow-[0_18px_55px_rgb(0_0_0/20%)] sm:p-9">
            <span className="grid size-12 place-items-center rounded-md bg-primary text-primary-foreground shadow-[0_0_28px_rgb(39_152_255/24%)]"><Feather className="size-5" /></span>
            <p className="mt-7 text-xs font-semibold tracking-[0.14em] text-accent-foreground">开始写作</p>

            <div className="mt-8 space-y-5">
              <label className="block" htmlFor="publication-name">
                <span className="mb-2 block text-sm font-medium">刊物名称</span>
                <Input id="publication-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：缓慢写作" className="h-11 bg-background" />
              </label>
            </div>

            {error && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
            <Button className="mt-7 h-11 rounded-md px-6 font-semibold" onClick={createPublication} disabled={busy}>
              {busy ? '正在创建…' : '创建刊物'} <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5 sm:px-8">
          <a href={appPath('/')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 收件箱</a>
          <span className="mx-auto font-serif-cn text-lg font-semibold">{publication.name}</span>
          <Button className="rounded-md font-semibold" onClick={createArticle} disabled={busy}><Plus className="size-4" /> 新文章</Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.13em] text-muted-foreground">写作者工作台</p>
            <h1 className="mt-2 font-serif-cn text-3xl font-semibold sm:text-4xl">你的文章</h1>
            <p className="mt-2 text-sm text-muted-foreground">bimu.cn/p/{publication.handle}</p>
          </div>
          <div className={`inline-flex items-center gap-2 self-start rounded-md px-3 py-2 text-xs ${identityStatus === 'verified' ? 'bg-[#e1f0ff] text-[#1768ad]' : 'bg-[#eef3f8] text-[#536b86]'}`}>
            <ShieldCheck className="size-4" />
            {identityStatus === 'verified' ? '已完成发布验证' : '完成实名验证后可公开发布'}
          </div>
        </div>

        {error && <p className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        <section className="mt-9 overflow-hidden rounded-lg border border-border bg-card/65">
          {workspaceArticles.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-md bg-secondary text-muted-foreground"><FileText className="size-5" /></span>
              <h2 className="mt-4 font-serif-cn text-xl font-semibold">从第一篇开始</h2>
              <p className="mt-2 text-sm text-muted-foreground">草稿会自动保存，只有你主动发布后才会公开。</p>
              <Button className="mt-6 rounded-md font-semibold" onClick={createArticle} disabled={busy}><Plus className="size-4" /> 新文章</Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {workspaceArticles.map((article) => (
                <a key={article.id} href={appPath(`/write/${article.id}`)} className="group flex items-center gap-4 px-5 py-5 transition-colors hover:bg-secondary/55 sm:px-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground"><FileText className="size-[18px]" /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-serif-cn text-lg font-semibold">{article.title || '无标题'}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{article.status === 'published' ? '已发布' : '草稿'} · 最近编辑 {formatDate(article.updatedAt)}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(value));
}

type ModelContext = {
  registerTool: (
    tool: {
      name: string;
      title?: string;
      description: string;
      inputSchema: object;
      annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
      execute: (input: unknown) => unknown | Promise<unknown>;
    },
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

function getModelContext() {
  return (document as { modelContext?: ModelContext }).modelContext;
}

function validateDraftToolInput(input: unknown) {
  if (input == null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) throw new Error('输入必须是对象。');
  const value = input as Record<string, unknown>;
  const allowed = new Set(['title', 'subtitle', 'bodyText']);
  if (Object.keys(value).some((key) => !allowed.has(key))) throw new Error('输入包含不支持的字段。');

  const result: { title?: string; subtitle?: string; bodyText?: string } = {};
  for (const [key, max] of [['title', 120], ['subtitle', 240], ['bodyText', 200000]] as const) {
    const field = value[key];
    if (field == null) continue;
    if (typeof field !== 'string' || field.length > max) throw new Error(`${key} 格式不正确。`);
    result[key] = field;
  }
  return result;
}
