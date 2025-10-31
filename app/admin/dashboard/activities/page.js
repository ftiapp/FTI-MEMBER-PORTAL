"use client";

import { memo, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import useAdminActivities from "./hooks/useAdminActivities";

/**
 * Admin Activities Page
 *
 * This component provides functionality for viewing all admin activities including:
 * - Admin login/logout events
 * - Member approval/rejection actions
 * - Address update approval/rejection actions
 * - Admin user management actions
 *
 * Only accessible to admin FTI_Portal_User with level 5 (SuperAdmin) permissions.
 *
 * Performance optimizations:
 * - Uses client-side caching with TTL to reduce API calls
 * - Implements memoization to prevent unnecessary re-renders
 * - Batches state updates for better UI responsiveness
 */

const ActivitiesPage = () => {
  // Add error boundary handling
  useEffect(() => {
    const handleError = (event) => {
      console.error("Activities page error:", event.error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม");
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Use the optimized hook for activities data and management
  const {
    activities,
    isLoading,
    error,
    filter,
    page,
    totalPages,
    dateRange,
    handleFilterChange,
    handleDateChange,
    applyDateFilter,
    clearDateFilter,
    setPage,
    refreshActivities,
    renderActivityTypeBadge,
    formatActivityDetails,
  } = useAdminActivities();

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        {/* Refresh button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={refreshActivities}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            disabled={isLoading}
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
            {isLoading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
        </div>

        {/* Error fallback */}
        {error && !isLoading && <div className="text-center py-12 text-red-500">{error}</div>}

        {/* Loading state */}
        {isLoading && !error ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !error && activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">ไม่พบข้อมูลกิจกรรม</div>
        ) : null}

        {/* Filter controls - only show when not loading or error */}
        {!isLoading && !error && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">กิจกรรมของแอดมิน</h2>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Filter by activity type */}
              <div className="w-full md:w-auto">
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="login">เข้าสู่ระบบ</option>
                  <option value="logout">ออกจากระบบ</option>
                  <option value="create">สร้าง</option>
                  <option value="update">แก้ไข</option>
                  <option value="delete">ลบ</option>
                  <option value="approve">อนุมัติ</option>
                  <option value="reject">ปฏิเสธ</option>
                </select>
              </div>

              {/* Date range filter */}
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <span className="self-center">ถึง</span>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  onClick={applyDateFilter}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  กรอง
                </button>
                <button
                  onClick={clearDateFilter}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  ล้าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activities table */}
        {!isLoading && !error && activities.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      วันที่และเวลา
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ผู้ดูแลระบบ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ประเภทกิจกรรม
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      รายละเอียด
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(activity.timestamp).toLocaleString("th-TH")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.adminName}
                        </div>
                        <div className="text-xs text-gray-500">Admin ID: {activity.adminId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const badge = renderActivityTypeBadge(activity.actionType);
                          return (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.bgColor} ${badge.textColor}`}
                            >
                              {badge.type}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-md break-words">
                          {activity.readableAction || formatActivityDetails(activity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{activity.ipAddress || "N/A"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    แสดง <span className="font-medium">{activities.length}</span> รายการ จากทั้งหมด{" "}
                    <span className="font-medium">{totalPages * activities.length}</span> รายการ
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                        page === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                        page === totalPages ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ActivitiesPage);
