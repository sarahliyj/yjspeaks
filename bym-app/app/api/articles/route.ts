import { createDraft } from '@/db/repository';
import { requireApiUser } from '@/lib/api-auth';
import { errorResponse, parseArticleInput } from '@/lib/domain';

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const input = parseArticleInput(await request.json());
    const article = await createDraft(user, input);
    return Response.json({ article }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
