"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ICMembershipManagementRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect IC management to the unified membership-requests dashboard
    router.replace("/admin/dashboard/membership-requests");
  }, [router]);

  return null;
}
