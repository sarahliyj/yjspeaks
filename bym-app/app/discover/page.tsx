import { redirect } from 'next/navigation';
import { appPath } from '@/lib/app-path';

export default function DiscoverPage() {
  redirect(appPath('/'));
}
