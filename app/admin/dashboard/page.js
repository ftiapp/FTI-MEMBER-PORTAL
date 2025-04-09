'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

/**
 * Admin Dashboard Component
 * 
 * This component serves as the main entry point for the admin dashboard.
 * It redirects users to the verify page by default.
 */

export default function AdminDashboard() {
  const router = useRouter();
  
  // Redirect to verify page on component mount
  useEffect(() => {
    router.push('/admin/dashboard/verify?status=0');
  }, [router]);

  return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
      </div>
    </AdminLayout>
  );
}
