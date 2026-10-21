const ENV_ID = process.env.CLOUDBASE_ENV_ID ?? 'bym-d4gv0ez405af4b758';
const RDB_BASE = `https://${ENV_ID}.api.tcloudbasegateway.com/v1/rdb/rest`;

type RdbOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string;
  returnRepresentation?: boolean;
};

export async function rdbRequest<T>(path: string, options: RdbOptions = {}) {
  const token = options.token || process.env.CLOUDBASE_PUBLISHABLE_KEY;
  if (!token) throw new Error('CloudBase access token is required.');

  const headers = new Headers(options.headers);
  headers.set('authorization', `Bearer ${token}`);
  headers.set('accept', 'application/json');
  if (options.body !== undefined) headers.set('content-type', 'application/json');
  if (options.returnRepresentation) headers.set('prefer', 'return=representation');

  const response = await fetch(`${RDB_BASE}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
  });

  const text = await response.text();
  const payload = text ? safeJson(text) : null;
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : `CloudBase database request failed (${response.status}).`;
    throw new Error(message);
  }
  return payload as T;
}

export function rdbTable<T>(table: string, query: string, token?: string) {
  return rdbRequest<T[]>(`/${table}?${query}`, { token });
}

export function rdbRpc<T>(name: string, params: Record<string, unknown>, token?: string) {
  return rdbRequest<T>(`/rpc/${name}`, {
    method: 'POST',
    body: params,
    token,
    returnRepresentation: true,
  });
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
