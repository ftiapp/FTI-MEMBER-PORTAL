'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useProductUpdateRequests } from './hooks/useProductUpdateRequests';
import RequestsList from './components/RequestsList';
import AdminLayout from '../components/AdminLayout';

/**
 * Admin page for managing product update requests
 * @returns {JSX.Element} - Admin product updates page
 */
export default function ProductUpdatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    requests,
    loading,
    error,
    pagination,
    filters,
    handlePageChange,
    handleFilterChange,
    approveRequest,
    handleReject
  } = useProductUpdateRequests();

  // Check for specific request ID in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      // If a specific request ID is provided, make sure we're showing all statuses
      handleFilterChange('status', 'all');
    }
  }, [searchParams]);

  // Handle session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/check-session');
        const data = await response.json();
        
        if (!data.success) {
          toast.error('กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้');
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error('เกิดข้อผิดพลาดในการตรวจสอบสถานะการเข้าสู่ระบบ');
      }
    };
    
    checkSession();
  }, [router]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">จัดการคำขอแก้ไขข้อมูลสินค้า</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        ) : (
          <RequestsList
            requests={requests}
            pagination={pagination}
            filters={filters}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            onApprove={approveRequest}
            onReject={handleReject}
          />
        )}
      </div>
    </AdminLayout>
  );
}
