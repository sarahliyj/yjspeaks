import { getSubscriptions, setSubscription } from '@/db/repository';
import { requireApiUser } from '@/lib/api-auth';
import { errorResponse, parseSubscriptionInput } from '@/lib/domain';

export async function GET(request: Request) {
  try {
    const user = await requireApiUser(request);
    const subscriptions = await getSubscriptions(user);
    return Response.json({ subscriptions });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(request);
    const input = parseSubscriptionInput(await request.json());
    const subscription = await setSubscription(user, input);
    return Response.json({ subscription });
  } catch (error) {
    return errorResponse(error);
  }
}
