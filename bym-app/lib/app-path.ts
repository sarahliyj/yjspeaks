const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? '';

export const APP_BASE_PATH = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, '')}`
  : '';

export function appPath(path = '/') {
  if (/^(?:https?:|mailto:|tel:|#)/.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!APP_BASE_PATH) return normalized;
  if (normalized === '/') return APP_BASE_PATH;
  if (normalized === APP_BASE_PATH || normalized.startsWith(`${APP_BASE_PATH}/`)) return normalized;
  return `${APP_BASE_PATH}${normalized}`;
}
