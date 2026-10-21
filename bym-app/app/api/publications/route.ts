import { createPublication } from '@/db/repository';
import { requireApiUser } from '@/lib/api-auth';
import { errorResponse, parsePublicationInput } from '@/lib/domain';

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const input = parsePublicationInput(await request.json());
    const publication = await createPublication(user, input);
    return Response.json({ publication }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
