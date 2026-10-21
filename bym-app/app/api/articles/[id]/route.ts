import { getOwnedArticle, updateDraft } from '@/db/repository';
import { requireApiUser } from '@/lib/api-auth';
import { errorResponse, parseArticleInput } from '@/lib/domain';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const { id } = await context.params;
    const article = await getOwnedArticle(user, id);
    return Response.json({ article });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    const { id } = await context.params;
    const input = parseArticleInput(await request.json());
    const article = await updateDraft(user, id, input);
    return Response.json({ article });
  } catch (error) {
    return errorResponse(error);
  }
}
