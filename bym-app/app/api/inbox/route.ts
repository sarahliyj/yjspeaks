import { getInbox } from '@/db/repository';
import { requireApiUser } from '@/lib/api-auth';
import { errorResponse } from '@/lib/domain';

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get('limit') ?? '30');
    const limit = Number.isFinite(requestedLimit) ? requestedLimit : 30;
    const items = await getInbox(user, limit);
    return Response.json({ items });
  } catch (error) {
    return errorResponse(error);
  }
}
