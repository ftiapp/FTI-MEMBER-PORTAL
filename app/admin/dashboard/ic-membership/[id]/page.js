'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ICMembershipDetailRedirect({ params }) {
  const router = useRouter();

  useEffect(() => {
    const id = params?.id;
    if (id) {
      router.replace(`/admin/dashboard/membership-requests/ic/${id}`);
    } else {
      router.replace('/admin/dashboard/membership-requests/ic');
    }
  }, [router, params]);

  return null;
}
