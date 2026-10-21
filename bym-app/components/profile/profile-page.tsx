'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Camera, FileText, LogOut, Pencil } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { authFetch } from '@/lib/cloudbase-client';
import { appPath } from '@/lib/app-path';

type Profile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  profileCompletedAt: number | null;
  publicationName: string | null;
  publicationHandle: string | null;
  subscriberCount: number;
  subscriptionCount: number;
};

type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImageUrl: string;
  publishedAt: number;
  publicationHandle: string;
};

type ProfilePayload = { profile: Profile; articles: Article[]; error?: { message?: string } };

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void authFetch('/api/profile')
      .then(async (response) => {
        if (!response.ok) throw new Error('AUTH_REQUIRED');
        const payload = (await response.json()) as ProfilePayload;
        applyPayload(payload);
        setEditing(!payload.profile.profileCompletedAt);
      })
      .catch(() => window.location.replace(appPath('/login?returnTo=/profile')));
  }, []);

  function applyPayload(payload: ProfilePayload) {
    setProfile(payload.profile);
    setArticles(payload.articles ?? []);
    setDisplayName(payload.profile.displayName);
    setBio(payload.profile.bio || '');
    setAvatarUrl(payload.profile.avatarUrl || '');
  }

  async function saveProfile() {
    setBusy(true);
    setError('');
    try {
      const response = await authFetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName, bio, avatarUrl }),
      });
      const payload = (await response.json()) as ProfilePayload;
      if (!response.ok) throw new Error(payload.error?.message || '保存失败。');
      applyPayload(payload);
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '保存失败。');
    } finally {
      setBusy(false);
    }
  }

  async function skipSetup() {
    setBusy(true);
    setError('');
    try {
      const response = await authFetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ skip: true }),
      });
      const payload = (await response.json()) as ProfilePayload;
      if (!response.ok) throw new Error(payload.error?.message || '暂时无法跳过。');
      applyPayload(payload);
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '暂时无法跳过。');
    } finally {
      setBusy(false);
    }
  }

  function chooseAvatar(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1_000_000) {
      setError('请选择小于 1MB 的 JPG、PNG 或 WebP 图片。');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  }

  async function logout() {
    await fetch(appPath('/api/auth/logout'), { method: 'POST', credentials: 'same-origin' });
    window.location.replace(appPath('/'));
  }

  if (!profile) return <p className="p-8 text-sm text-muted-foreground">正在载入…</p>;
  const handle = profile.email.split('@')[0];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5 sm:px-8">
          <a href={appPath('/')} className="icon-button" aria-label="返回首页"><ArrowLeft className="size-[18px]" /></a>
          <a href={appPath('/')} className="mx-auto" aria-label="Bym 笔姆首页"><BrandLogo className="h-6 w-auto" /></a>
          <button onClick={logout} className="icon-button" aria-label="退出登录"><LogOut className="size-[18px]" /></button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <section className="grid gap-8 border-b border-border pb-8 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <h1 className="font-serif-cn text-4xl font-semibold tracking-tight">{profile.displayName}</h1>
            <p className="mt-1 text-base text-muted-foreground">@{handle}</p>
            {profile.bio && <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">{profile.bio}</p>}
            <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{profile.subscriberCount || 0}</strong> 订阅者</span>
              <span><strong className="text-foreground">{profile.subscriptionCount || 0}</strong> 订阅</span>
            </div>
          </div>
          <Avatar profile={profile} />
        </section>

        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-border py-5">
          <a href={appPath('/write')} className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">写文章</a>
          <Button variant="outline" className="h-11 rounded-md px-5" onClick={() => setEditing(true)}><Pencil className="size-4" /> 编辑资料</Button>
        </div>

        <div className="flex gap-8 border-b border-border text-sm font-semibold">
          <span className="border-b-2 border-foreground px-1 py-4">文章</span>
          <span className="px-1 py-4 text-muted-foreground">订阅（{profile.subscriptionCount || 0}）</span>
        </div>

        <section className="divide-y divide-border">
          {articles.map((article) => (
            <a key={article.id} href={appPath(`/p/${article.publicationHandle}/${article.slug}`)} className="grid gap-5 py-7 sm:grid-cols-[1fr_170px] sm:items-center">
              <div>
                <p className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>
                <h2 className="mt-2 font-serif-cn text-2xl font-semibold">{article.title}</h2>
                {article.subtitle && <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{article.subtitle}</p>}
              </div>
              {article.coverImageUrl && <img src={article.coverImageUrl} alt={`《${article.title}》封面`} className="aspect-[3/2] w-full rounded-md object-cover" />}
            </a>
          ))}
          {articles.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">还没有发布文章</p>
              <a href={appPath('/write')} className="mt-5 inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold">开始写作</a>
            </div>
          )}
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1f35]/35 p-5 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title">
            <h2 id="profile-editor-title" className="font-serif-cn text-2xl font-semibold">{profile.profileCompletedAt ? '编辑资料' : '完善个人资料'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">头像、名字和简介都可以稍后再填写。</p>

            <div className="mt-6 flex items-center gap-4">
              <Avatar profile={{ ...profile, avatarUrl, displayName }} size="small" />
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold hover:bg-secondary">
                <Camera className="size-4" /> 选择头像
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => chooseAvatar(event.target.files?.[0])} />
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">名字</span>
                <Input value={displayName} maxLength={40} onChange={(event) => setDisplayName(event.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">简介</span>
                <Textarea value={bio} maxLength={160} onChange={(event) => setBio(event.target.value)} className="min-h-24 resize-none" />
              </label>
            </div>

            {error && <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              {!profile.profileCompletedAt && <Button variant="ghost" onClick={skipSetup} disabled={busy}>暂时跳过</Button>}
              {profile.profileCompletedAt && <Button variant="ghost" onClick={() => setEditing(false)} disabled={busy}>取消</Button>}
              <Button onClick={saveProfile} disabled={busy || !displayName.trim()}>{busy ? '保存中…' : '保存'}</Button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Avatar({ profile, size = 'large' }: { profile: Pick<Profile, 'avatarUrl' | 'displayName'>; size?: 'large' | 'small' }) {
  const className = size === 'large' ? 'size-28 sm:size-32' : 'size-16';
  return profile.avatarUrl ? (
    <img src={profile.avatarUrl} alt={`${profile.displayName}的头像`} className={`${className} rounded-full object-cover ring-1 ring-border`} />
  ) : (
    <span className={`grid ${className} place-items-center rounded-full bg-[#e5f2ff] font-serif-cn text-3xl font-semibold text-[#1768ad] ring-1 ring-border`}>
      {profile.displayName.slice(0, 1) || '我'}
    </span>
  );
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}
