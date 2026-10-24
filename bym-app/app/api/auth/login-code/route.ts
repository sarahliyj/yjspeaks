import {
  authErrorResponse,
  cloudbaseAuthRequest,
  type CloudBaseTokens,
  withSessionCookies,
} from '@/lib/cloudbase-server-auth';

export async function POST(request: Request) {
  try {
    const { code, verificationId } = (await request.json()) as {
      code?: string;
      verificationId?: string;
    };
    if (!verificationId || !code) throw new Error('请输入邮箱验证码。');

    const verified = await cloudbaseAuthRequest('/verification/verify', {
      method: 'POST',
      body: JSON.stringify({
        verification_id: verificationId,
        verification_code: code,
      }),
    });
    const verificationToken = verified.verification_token;
    if (typeof verificationToken !== 'string') throw new Error('验证码验证失败。');

    const tokens = (await cloudbaseAuthRequest('/signin', {
      method: 'POST',
      body: JSON.stringify({ verification_token: verificationToken }),
    })) as CloudBaseTokens;
    return withSessionCookies(tokens, { ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
