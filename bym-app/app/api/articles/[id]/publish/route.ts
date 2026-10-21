import { publishArticle } from '@/db/repository';
import { requireApiUser } from '@/lib/api-auth';
import { errorResponse } from '@/lib/domain';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const { id } = await context.params;
    const article = await publishArticle(user, id);
    return Response.json({ article });
  } catch (error) {
    return errorResponse(error);
  }
}
