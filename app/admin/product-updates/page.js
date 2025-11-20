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
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 11h14M7 15h10M9 19h6"
                />
              </svg>
              จัดการคำขอแก้ไขข้อมูลสินค้า
            </h1>

            <button
              onClick={refreshData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium disabled:opacity-70"
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
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-500 text-sm">กำลังโหลดข้อมูลคำขอแก้ไขข้อมูลสินค้า...</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
                  <span className="block sm:inline ml-2 text-sm">{error}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    filters.status === "pending"
                      ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                  }`}
                  onClick={() => handleFilterChange("status", "pending")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">รออนุมัติ</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {filters.status === "pending" ? pagination.total : "-"}
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-full ${
                        filters.status === "pending" ? "bg-yellow-400" : "bg-gray-200"
                      }`}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    filters.status === "approved"
                      ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                  }`}
                  onClick={() => handleFilterChange("status", "approved")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">อนุมัติแล้ว</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {filters.status === "approved" ? pagination.total : "-"}
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-full ${
                        filters.status === "approved" ? "bg-green-500" : "bg-gray-200"
                      }`}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    filters.status === "rejected"
                      ? "border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                  }`}
                  onClick={() => handleFilterChange("status", "rejected")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">ปฏิเสธแล้ว</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {filters.status === "rejected" ? pagination.total : "-"}
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-full ${
                        filters.status === "rejected" ? "bg-red-500" : "bg-gray-200"
                      }`}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-gray-50 p-2 rounded-lg flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "pending")}
                  className={`flex-1 min-w-[120px] py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filters.status === "pending"
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md transform scale-[1.02]"
                      : "text-gray-700 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  รออนุมัติ
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "approved")}
                  className={`flex-1 min-w-[120px] py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filters.status === "approved"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md transform scale-[1.02]"
                      : "text-gray-700 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  อนุมัติแล้ว
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "rejected")}
                  className={`flex-1 min-w-[120px] py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filters.status === "rejected"
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md transform scale-[1.02]"
                      : "text-gray-700 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  ปฏิเสธแล้ว
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "all")}
                  className={`flex-1 min-w-[120px] py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filters.status === "all"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-[1.02]"
                      : "text-gray-700 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  ทั้งหมด
                </button>
              </div>

              <RequestsList
                requests={requests}
                pagination={pagination}
                filters={filters}
                onPageChange={handlePageChange}
                onFilterChange={handleFilterChange}
                onApprove={approveRequest}
                onReject={handleReject}
              />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ProductUpdatesPage);
