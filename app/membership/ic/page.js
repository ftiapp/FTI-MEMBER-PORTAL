import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/session';
import ICPageClient from './components/ICPageClient';

export default async function ICMembership() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect('/login?redirect=/membership/ic');
  }

  return <ICPageClient />;
}