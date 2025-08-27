import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/session';
import OCPageClient from './components/OCPageClient';

export default async function OCMembership() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect('/login?redirect=/membership/oc');
  }

  return <OCPageClient />;
}