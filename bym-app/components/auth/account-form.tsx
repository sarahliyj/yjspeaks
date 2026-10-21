'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { appPath } from '@/lib/app-path';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AccountForm({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function returnTo() {
    const value = new URLSearchParams(window.location.search).get('returnTo');
    return appPath(value?.startsWith('/') && !value.startsWith('//') ? value : '/');
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') {
        const response = await fetch(appPath('/api/auth/login'), {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const result = (await response.json()) as { error?: { message?: string } };
        if (!response.ok) throw new Error(result.error?.message ?? '登录失败。');
        window.location.assign(returnTo());
        return;
      }

      if (!awaitingCode) {
        const response = await fetch(appPath('/api/auth/send-code'), {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const result = (await response.json()) as {
          verificationId?: string;
          isUser?: boolean;
          error?: { message?: string };
        };
        if (!response.ok) throw new Error(result.error?.message ?? '验证码发送失败。');
        if (result.isUser) throw new Error('这个邮箱已经注册，请直接登录。');
        if (!result.verificationId) throw new Error('未能发送验证码，请稍后再试。');
        setVerificationId(result.verificationId);
        setAwaitingCode(true);
        return;
      }

      const response = await fetch(appPath('/api/auth/signup'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, code, verificationId }),
      });
      const result = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(result.error?.message ?? '注册失败。');
      window.location.assign(returnTo());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '操作失败，请稍后再试。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto max-w-md">
        <a href={appPath('/')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回首页
        </a>
        <div className="mt-12 rounded-lg border border-border bg-card p-6 sm:p-8">
          <BrandLogo className="h-8 w-auto" />
          <h1 className="mt-8 font-serif-cn text-3xl font-semibold">{mode === 'login' ? '登录' : '创建账号'}</h1>

          <form className="mt-7 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">邮箱</span>
              <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={awaitingCode} />
            </label>
            {!awaitingCode && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">密码</span>
                <Input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
            )}
            {awaitingCode && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">邮箱验证码</span>
                <Input inputMode="numeric" required value={code} onChange={(event) => setCode(event.target.value)} />
              </label>
            )}
            {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full rounded-md font-semibold" disabled={busy}>
              {busy ? '请稍候…' : mode === 'login' ? '登录' : awaitingCode ? '验证并创建账号' : '发送验证码'}
            </Button>
          </form>

          {!awaitingCode && (
            <button
              className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            >
              {mode === 'login' ? '没有账号？创建账号' : '已有账号？登录'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
