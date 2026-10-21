'use client';

import { useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { appPath } from '@/lib/app-path';

export function InviteFriend() {
  const [copied, setCopied] = useState(false);

  async function invite() {
    const url = `${window.location.origin}${appPath('/')}`;
    const shareData = { title: '笔姆 · Bym', text: '来笔姆读点值得慢慢读的文字。', url };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button onClick={invite} className="group flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-[#71afe5] hover:bg-secondary/45">
      <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
        {copied ? <Check className="size-4" /> : <UserPlus className="size-4" />}
      </span>
      <span>
        <span className="block text-sm font-semibold">邀请朋友</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{copied ? '链接已复制' : '分享笔姆链接'}</span>
      </span>
    </button>
  );
}
