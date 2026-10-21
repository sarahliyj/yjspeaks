const handlePattern = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parsePublicationInput(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw new DomainError('INVALID_INPUT', '请填写刊物信息。');
  }

  const body = input as Record<string, unknown>;
  const name = stringField(body.name, '刊物名称', 2, 40);
  const handle = stringField(body.handle, '刊物地址', 3, 30).toLowerCase();
  const description = optionalString(body.description, 160);

  if (!handlePattern.test(handle)) {
    throw new DomainError(
      'INVALID_HANDLE',
      '刊物地址只能使用小写字母、数字和连字符，且不能以连字符开头或结尾。',
    );
  }

  return { name, handle, description };
}

export function parseArticleInput(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw new DomainError('INVALID_INPUT', '请填写文章内容。');
  }

  const body = input as Record<string, unknown>;
  const title = optionalString(body.title, 120) || '无标题';
  const subtitle = optionalString(body.subtitle, 240);
  const coverImageUrl = optionalString(body.coverImageUrl, 2_000);
  const bodyDocument = optionalString(body.bodyDocument, 500_000) || '{}';
  const bodyText = optionalString(body.bodyText, 200_000);

  assertJsonDocument(bodyDocument);
  return { title, subtitle, coverImageUrl, bodyDocument, bodyText };
}

export function parseSubscriptionInput(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw new DomainError('INVALID_INPUT', '缺少订阅信息。');
  }

  const body = input as Record<string, unknown>;
  const publicationId = stringField(body.publicationId, '刊物', 1, 80);
  const active = body.active !== false;
  const emailDelivery = body.emailDelivery === true;
  return { publicationId, active, emailDelivery };
}

export function parseNewsletterSubscriptionInput(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw new DomainError('INVALID_INPUT', '请输入有效的邮箱地址。');
  }

  const body = input as Record<string, unknown>;
  const email = normalizeEmail(stringField(body.email, '邮箱', 3, 254));
  const honeypot = optionalString(body.website, 200);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new DomainError('INVALID_EMAIL', '请输入有效的邮箱地址。');
  }

  return { email, honeypot };
}

export function errorResponse(error: unknown) {
  if (error instanceof DomainError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  console.error(error);
  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: '暂时无法完成，请稍后再试。' } },
    { status: 500 },
  );
}

function stringField(
  value: unknown,
  label: string,
  minLength: number,
  maxLength: number,
) {
  if (typeof value !== 'string') {
    throw new DomainError('INVALID_INPUT', `${label}不能为空。`);
  }
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new DomainError(
      'INVALID_INPUT',
      `${label}需要 ${minLength}–${maxLength} 个字符。`,
    );
  }
  return normalized;
}

function optionalString(value: unknown, maxLength: number) {
  if (value == null) return '';
  if (typeof value !== 'string') {
    throw new DomainError('INVALID_INPUT', '输入格式不正确。');
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new DomainError('INVALID_INPUT', `内容不能超过 ${maxLength} 个字符。`);
  }
  return normalized;
}

function assertJsonDocument(value: string) {
  try {
    JSON.parse(value);
  } catch {
    throw new DomainError('INVALID_DOCUMENT', '文章内容格式不正确。');
  }
}
