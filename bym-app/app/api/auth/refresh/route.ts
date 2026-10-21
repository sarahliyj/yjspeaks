import {
  authErrorResponse,
  clearSessionCookies,
  cloudbaseAuthRequest,
  readCookie,
  REFRESH_COOKIE,
  type CloudBaseTokens,
  withSessionCookies,
} from '@/lib/cloudbase-server-auth';

export async function POST(request: Request) {
  try {
    const refreshToken = readCookie(request, REFRESH_COOKIE);
    if (!refreshToken) return clearSessionCookies({ error: { message: '请重新登录。' } }, 401);
    const refreshed = (await cloudbaseAuthRequest('/token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'bym-d4gv0ez405af4b758',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })) as CloudBaseTokens;
    return withSessionCookies(
      { ...refreshed, refresh_token: refreshed.refresh_token || refreshToken },
      { ok: true },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
