import { ensureAppUser } from '@/db/repository';
import { ACCESS_COOKIE, readCookie } from '@/lib/cloudbase-server-auth';
import { DomainError } from '@/lib/domain';

const USER_ENDPOINT =
  'https://bym-d4gv0ez405af4b758.api.tcloudbasegateway.com/auth/v1/user/me';

export async function requireApiUser(request: Request) {
  const accessToken = readCookie(request, ACCESS_COOKIE);
  if (!accessToken) throwAuthRequired();

  const response = await fetch(USER_ENDPOINT, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throwAuthRequired();

  const profile = (await response.json()) as Record<string, unknown>;
  const nested = object(profile.data);
  const account = Object.keys(nested).length ? nested : profile;
  const userId = text(account.sub) || text(account.id) || text(account.uid);
  const email = text(account.email);
  if (!userId || !email) throwAuthRequired();

  const metadata = object(account.user_metadata);
  const identity = {
    userId,
    email,
    displayName:
      text(metadata.name) || text(metadata.nickName) || text(account.name) || email,
  };
  const user = await ensureAppUser(identity, accessToken);
  return { ...user, accessToken };
}

function throwAuthRequired(): never {
  throw new DomainError('AUTH_REQUIRED', '请先登录。', 401);
}

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
