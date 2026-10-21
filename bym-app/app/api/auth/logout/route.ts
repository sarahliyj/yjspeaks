import { clearSessionCookies } from '@/lib/cloudbase-server-auth';

export async function POST() {
  return clearSessionCookies();
}
