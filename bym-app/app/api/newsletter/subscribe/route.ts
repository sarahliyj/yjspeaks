import { createNewsletterSubscriber } from '@/db/repository';
import { DomainError, parseNewsletterSubscriptionInput } from '@/lib/domain';

const allowedOrigins = new Set([
  'https://yjspeaks.com',
  'https://www.yjspeaks.com',
]);

function requestOrigin(request: Request) {
  return request.headers.get('origin') ?? '';
}

function isAllowedOrigin(origin: string) {
  if (allowedOrigins.has(origin)) return true;
  const configuredOrigins = [
    process.env.SITE_ORIGIN,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined,
  ];

  for (const value of configuredOrigins) {
    if (!value) continue;
    try {
      if (new URL(value).origin === origin) return true;
    } catch {
      // Ignore malformed optional deployment configuration.
    }
  }

  return false;
}

function headers(origin: string) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

function json(payload: unknown, origin: string, status = 200) {
  return Response.json(payload, { status, headers: headers(origin) });
}

export function OPTIONS(request: Request) {
  const origin = requestOrigin(request);
  if (!isAllowedOrigin(origin)) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: headers(origin) });
}

export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (!isAllowedOrigin(origin)) {
    return Response.json({ error: { code: 'ORIGIN_NOT_ALLOWED', message: '请求来源不被允许。' } }, { status: 403 });
  }

  try {
    const { email, honeypot } = parseNewsletterSubscriptionInput(await request.json());

    // Do not reveal bot detection to an automated submitter.
    if (honeypot) return json({ status: 'accepted' }, origin, 202);

    await createNewsletterSubscriber(email);
    return json({ status: 'pending' }, origin, 202);
  } catch (error) {
    if (error instanceof DomainError) {
      return json({ error: { code: error.code, message: error.message } }, origin, error.status);
    }

    console.error(error);
    return json(
      { error: { code: 'INTERNAL_ERROR', message: '暂时无法订阅，请稍后再试。' } },
      origin,
      500,
    );
  }
}
