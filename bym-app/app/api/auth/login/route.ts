import {
  authErrorResponse,
  cloudbaseAuthRequest,
  type CloudBaseTokens,
  withSessionCookies,
} from '@/lib/cloudbase-server-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (!email || !password) throw new Error('请输入邮箱和密码。');
    const tokens = (await cloudbaseAuthRequest('/signin', {
      method: 'POST',
      body: JSON.stringify({ username: email.trim().toLowerCase(), password }),
    })) as CloudBaseTokens;
    return withSessionCookies(tokens, { ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
