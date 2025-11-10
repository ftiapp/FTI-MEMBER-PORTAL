"use client";

import { useState, useEffect, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { RequestList, RequestDetail, RejectReasonModal } from "./components";
import useAddressUpdateRequests from "./hooks/useAddressUpdateRequests";

const AddressUpdatesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "pending";

  // Use the optimized hook for address update requests
  const {
    requests,
    loading,
    selectedRequest,
    adminNotes,
    rejectReason,
    isProcessing,
    showRejectModal,
    searchTerm,
    pagination,
    fetchRequests,
    setSelectedRequest,
    setAdminNotes,
    setRejectReason,
    setShowRejectModal,
    setSearchTerm,
    approveRequest,
    rejectRequest,
    getStatusName,
  } = useAddressUpdateRequests();

  // Count requests by status for cards
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Fetch counts for all statuses
  const fetchAllCounts = async () => {
    try {
      const statuses = ['pending', 'approved', 'rejected'];
      const counts = {};
      
      await Promise.all(
        statuses.map(async (s) => {
          const response = await fetch(`/api/admin/address-update/list?status=${s}&limit=1`);
          const data = await response.json();
          counts[s] = data.pagination?.total || 0;
        })
      );
      
      setStatusCounts(counts);
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  // Check admin session and fetch requests when component mounts or status changes
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await fetch("/api/admin/check-session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          router.push("/admin/login");
          return;
        }

        // Fetch requests with the current status
        fetchRequests(status);
        // Fetch all counts for display
        fetchAllCounts();
      } catch (error) {
        console.error("Error checking admin session:", error);
        router.push("/admin/login");
      }
    };

    checkAdminSession();
  }, [status]);

  const handleStatusChange = (newStatus) => {
    // Reset selection and search when switching status
    setSelectedRequest(null);
    setAdminNotes("");
    setRejectReason("");
    setSearchTerm("");
    router.push(`/admin/address-updates?status=${newStatus}`);
    // After route updates, trigger a fresh fetch
    fetchRequests(newStatus, 1, "", true);
  };

  const handlePageChange = (newPage) => {
    // Clear selection when changing pages to avoid stale details
    setSelectedRequest(null);
    // Force fresh fetch to avoid cache oddities after searches
    fetchRequests(status, newPage, searchTerm, true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset selection and go to page 1
    setSelectedRequest(null);
    fetchRequests(status, 1, searchTerm, true); // Skip cache when searching
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setRejectReason("");
  };

  const handleApprove = async (editedAddress) => {
    const success = await approveRequest(editedAddress);
    if (success) {
      // Refetch the current status data after successful approval
      fetchRequests(status, pagination.page, searchTerm, true);
      // Refresh counts
      fetchAllCounts();
    }
  };

  const handleReject = async () => {
    const success = await rejectRequest();
    if (success) {
      // Refetch the current status data after successful rejection
      fetchRequests(status, pagination.page, searchTerm, true);
      // Refresh counts
      fetchAllCounts();
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
      >
        {/* Header with gradient */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  className="w-7 h-7 text-[#1e3a8a]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                คำขอแก้ไขที่อยู่
              </h1>
              <p className="text-sm text-gray-500 mt-1">จัดการคำขอแก้ไขที่อยู่ของสมาชิก</p>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => {
                fetchRequests(status, pagination.page, searchTerm, true);
                fetchAllCounts();
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
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
        </div>

        {/* Status Cards - Display Only (Not Clickable) */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  รอการอนุมัติ
                </div>
                <div className="text-3xl font-bold text-gray-900">{statusCounts.pending}</div>
              </div>
              <div className="p-3 rounded-full bg-yellow-400">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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

          <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  อนุมัติแล้ว
                </div>
                <div className="text-3xl font-bold text-gray-900">{statusCounts.approved}</div>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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

          <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ปฏิเสธแล้ว
                </div>
                <div className="text-3xl font-bold text-gray-900">{statusCounts.rejected}</div>
              </div>
              <div className="p-3 rounded-full bg-red-500">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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

        {/* Tab Switch - Main Filter */}
        <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-lg">
          <button
            onClick={() => handleStatusChange("pending")}
            className={`flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              status === "pending"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              รอการอนุมัติ ({statusCounts.pending})
            </div>
          </button>
          <button
            onClick={() => handleStatusChange("approved")}
            className={`flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              status === "approved"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              อนุมัติแล้ว ({statusCounts.approved})
            </div>
          </button>
          <button
            onClick={() => handleStatusChange("rejected")}
            className={`flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
              status === "rejected"
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              ปฏิเสธแล้ว ({statusCounts.rejected})
            </div>
          </button>
        </div>

        {/* Search Bar - Improved */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสสมาชิกหรือชื่อบริษัท"
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            ค้นหา
          </button>
        </form>

        {/* Debug Button */}
        <div className="mb-6">
          <a
            href="/api/admin/address-update/debug"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm border border-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ตรวจสอบข้อมูลในฐานข้อมูล
          </a>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#1e3a8a]"></div>
            <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-600 font-medium text-lg">
              ไม่พบคำขอแก้ไขที่อยู่ที่มีสถานะ {getStatusName(status)}
            </p>
            <p className="text-gray-500 text-sm mt-1">ลองเลือกสถานะอื่นหรือค้นหาด้วยคำค้นอื่น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request List */}
            <div className="lg:col-span-1 space-y-4">
              <RequestList
                requests={requests}
                selectedRequestId={selectedRequest?.id}
                onViewRequest={handleViewRequest}
              />

              {/* Pagination - Improved */}
              {pagination.totalPages > 1 && (
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">
                      หน้า <span className="font-bold text-[#1e3a8a]">{pagination.page}</span> /{" "}
                      {pagination.totalPages}
                    </div>
                    <div className="text-sm text-gray-600">
                      ทั้งหมด <span className="font-bold text-[#1e3a8a]">{pagination.total}</span>{" "}
                      รายการ
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        pagination.page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
                      }`}
                    >
                      «
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        pagination.page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
                      }`}
                    >
                      ‹ ย้อนกลับ
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        pagination.page === pagination.totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:from-[#2563eb] hover:to-[#1e3a8a] shadow-sm"
                      }`}
                    >
                      ถัดไป ›
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        pagination.page === pagination.totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
                      }`}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Request Details */}
            <RequestDetail
              selectedRequest={selectedRequest}
              adminNotes={adminNotes}
              setAdminNotes={setAdminNotes}
              isProcessing={isProcessing}
              handleApprove={handleApprove}
              onRejectClick={() => setShowRejectModal(true)}
            />
          </div>
        )}
      </motion.div>

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isVisible={showRejectModal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        onCancel={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isProcessing={isProcessing}
      />
    </AdminLayout>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(AddressUpdatesPage);