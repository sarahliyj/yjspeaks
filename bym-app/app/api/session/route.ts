import { requireApiUser } from '@/lib/api-auth';
import { errorResponse } from '@/lib/domain';

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    return Response.json(
      { user: { id: user.id, displayName: user.displayName, email: user.email } },
      { headers: { 'cache-control': 'private, no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
