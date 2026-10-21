import { getDiscoverArticles } from '@/db/repository';
import { errorResponse } from '@/lib/domain';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get('limit') ?? '50');
    const limit = Number.isFinite(requestedLimit) ? requestedLimit : 50;
    const articles = await getDiscoverArticles(limit);
    return Response.json({ articles });
  } catch (error) {
    return errorResponse(error);
  }
}
