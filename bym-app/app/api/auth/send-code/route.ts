import { authErrorResponse, cloudbaseAuthRequest } from '@/lib/cloudbase-server-auth';

export async function POST(request: Request) {
  try {
    const { email, purpose } = (await request.json()) as {
      email?: string;
      purpose?: 'login' | 'signup';
    };
    if (!email?.includes('@')) throw new Error('请输入有效邮箱。');
    const result = await cloudbaseAuthRequest('/verification', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        target: purpose === 'login' ? 'USER' : 'ANY',
      }),
    });
    return Response.json({
      verificationId: result.verification_id,
      isUser: result.is_user === true,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
