const AUTH_BASE =
  'https://bym-d4gv0ez405af4b758.api.tcloudbasegateway.com/auth/v1';

export const ACCESS_COOKIE = 'bym_access_token';
export const REFRESH_COOKIE = 'bym_refresh_token';

export type CloudBaseTokens = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};

export async function cloudbaseAuthRequest(
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  if (init.body) headers.set('content-type', 'application/json');

  const response = await fetch(`${AUTH_BASE}${path}`, { ...init, headers });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      text(payload.error_description) || text(payload.error) || '认证服务暂时不可用。';
    throw new CloudBaseAuthError(message, response.status);
  }
  return payload;
}

export function withSessionCookies(tokens: CloudBaseTokens, body: unknown) {
  const response = Response.json(body);
  response.headers.append(
    'set-cookie',
    cookie(ACCESS_COOKIE, tokens.access_token, tokens.expires_in ?? 7200),
  );
  response.headers.append(
    'set-cookie',
    cookie(REFRESH_COOKIE, tokens.refresh_token, 60 * 60 * 24 * 30),
  );
  return response;
}

export function clearSessionCookies(body: unknown = { ok: true }, status = 200) {
  const response = Response.json(body, { status });
  response.headers.append('set-cookie', cookie(ACCESS_COOKIE, '', 0));
  response.headers.append('set-cookie', cookie(REFRESH_COOKIE, '', 0));
  return response;
}

export function readCookie(request: Request, name: string) {
  const cookies = request.headers.get('cookie') ?? '';
  for (const entry of cookies.split(';')) {
    const [key, ...value] = entry.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return '';
}

export function authErrorResponse(error: unknown) {
  if (error instanceof CloudBaseAuthError) {
    return Response.json({ error: { message: error.message } }, { status: error.status });
  }
  return Response.json(
    { error: { message: error instanceof Error ? error.message : '操作失败。' } },
    { status: 500 },
  );
}

export class CloudBaseAuthError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}
