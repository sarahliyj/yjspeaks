'use client';

import { useEffect, useState } from 'react';
import { ArticleEditor } from '@/components/writer/article-editor';
import { authFetch } from '@/lib/cloudbase-client';
import { appPath } from '@/lib/app-path';

type Article = Parameters<typeof ArticleEditor>[0]['article'];

export function EditorPage({ id }: { id: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void authFetch(`/api/articles/${id}`)
      .then(async (response) => {
        if (response.status === 401) throw new Error('AUTH_REQUIRED');
        const payload = (await response.json()) as { article?: Article; error?: { message?: string } };
        if (!response.ok || !payload.article) throw new Error(payload.error?.message ?? '无法打开文章。');
        setArticle(payload.article);
      })
      .catch((caught) => {
        if (caught instanceof Error && caught.message === 'AUTH_REQUIRED') {
          window.location.replace(appPath(`/login?returnTo=${encodeURIComponent(`/write/${id}`)}`));
          return;
        }
        setError(caught instanceof Error ? caught.message : '无法打开文章。');
      });
  }, [id]);

  if (error) return <p className="p-8 text-sm text-destructive">{error}</p>;
  if (!article) return <p className="p-8 text-sm text-muted-foreground">正在载入…</p>;
  return <ArticleEditor article={article} />;
}
