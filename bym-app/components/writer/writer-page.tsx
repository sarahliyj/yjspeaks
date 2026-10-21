'use client';

import { useEffect, useState } from 'react';
import { WriterWorkspace } from '@/components/writer/writer-workspace';
import { authFetch } from '@/lib/cloudbase-client';
import { appPath } from '@/lib/app-path';

type Workspace = {
  user: { identityStatus: string };
  publication: Parameters<typeof WriterWorkspace>[0]['publication'];
  articles: Parameters<typeof WriterWorkspace>[0]['articles'];
};

export function WriterPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void authFetch('/api/me')
      .then(async (response) => {
        if (response.status === 401) throw new Error('AUTH_REQUIRED');
        if (!response.ok) throw new Error('无法打开写作工作台。');
        setWorkspace((await response.json()) as Workspace);
      })
      .catch((caught) => {
        if (caught instanceof Error && caught.message === 'AUTH_REQUIRED') {
          window.location.replace(appPath('/login?returnTo=/write'));
          return;
        }
        setError(caught instanceof Error ? caught.message : '无法打开写作工作台。');
      });
  }, []);

  if (error) return <p className="p-8 text-sm text-destructive">{error}</p>;
  if (!workspace) return <p className="p-8 text-sm text-muted-foreground">正在载入…</p>;

  return (
    <WriterWorkspace
      publication={workspace.publication}
      articles={workspace.articles}
      identityStatus={workspace.user.identityStatus}
    />
  );
}
