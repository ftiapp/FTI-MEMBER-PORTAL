"use client";

import { useEffect, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useProductUpdateRequests } from "./hooks/useProductUpdateRequests";
import RequestsList from "./components/RequestsList";
import AdminLayout from "../components/AdminLayout";

/**
 * Admin page for managing product update requests
 * @returns {JSX.Element} - Admin product updates page
 */
function ProductUpdatesPage() {
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
    handleReject,
    refreshData,
  } = useProductUpdateRequests();

  // Check for specific request ID in URL
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      // If a specific request ID is provided, make sure we're showing all statuses
      handleFilterChange("status", "all");
    }
  }, [searchParams]);

  // Handle session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/check-session");
        const data = await response.json();

        if (!data.success) {
          toast.error("กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้");
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        toast.error("เกิดข้อผิดพลาดในการตรวจสอบสถานะการเข้าสู่ระบบ");
      }
    };

    checkSession();
  }, [router]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">จัดการคำขอแก้ไขข้อมูลสินค้า</h1>

          <button
            onClick={refreshData}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
        </div>

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

// Memoize the component to prevent unnecessary re-renders
export default memo(ProductUpdatesPage);
