import { getWriterWorkspace } from '@/db/repository';
import { requireApiUser } from '@/lib/api-auth';
import { errorResponse } from '@/lib/domain';

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const workspace = await getWriterWorkspace(user);
    return Response.json({ user, ...workspace });
  } catch (error) {
    return errorResponse(error);
  }
}
