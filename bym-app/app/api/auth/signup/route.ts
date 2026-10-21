import {
  authErrorResponse,
  cloudbaseAuthRequest,
  type CloudBaseTokens,
  withSessionCookies,
} from '@/lib/cloudbase-server-auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      code?: string;
      verificationId?: string;
    };
    if (!body.email?.includes('@') || !body.verificationId || !body.code) {
      throw new Error('注册信息不完整。');
    }
    if (!body.password || body.password.length < 8) throw new Error('密码至少需要 8 位。');

    const verified = await cloudbaseAuthRequest('/verification/verify', {
      method: 'POST',
      body: JSON.stringify({
        verification_id: body.verificationId,
        verification_code: body.code,
      }),
    });
    const verificationToken = verified.verification_token;
    if (typeof verificationToken !== 'string') throw new Error('验证码验证失败。');

    const tokens = (await cloudbaseAuthRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: body.email.trim().toLowerCase(),
        password: body.password,
        verification_token: verificationToken,
      }),
    })) as CloudBaseTokens;

    return withSessionCookies(tokens, { ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
