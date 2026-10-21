import { appPath } from '@/lib/app-path';

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const target = typeof input === 'string' ? appPath(input) : input;
  let response = await fetch(target, { ...init, credentials: 'same-origin' });
  if (response.status !== 401) return response;

  const refreshed = await fetch(appPath('/api/auth/refresh'), {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!refreshed.ok) throw new Error('AUTH_REQUIRED');
  response = await fetch(target, { ...init, credentials: 'same-origin' });
  if (response.status === 401) throw new Error('AUTH_REQUIRED');
  return response;
}
