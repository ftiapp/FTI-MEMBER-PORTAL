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
    }
  };

  const handleReject = async () => {
    const success = await rejectRequest();
    if (success) {
      // Refetch the current status data after successful rejection
      fetchRequests(status, pagination.page, searchTerm, true);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  // Using getStatusName from the hook

  return (
    <AdminLayout>
      <motion.div
        className="space-y-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="flex justify-between items-center">
          <motion.h1
            className="text-2xl font-bold text-black"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            คำขอแก้ไขที่อยู่
          </motion.h1>

          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {/* Refresh button */}
            <button
              onClick={() => fetchRequests(status, pagination.page, searchTerm, true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 mr-2"
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
            <button
              onClick={() => handleStatusChange("pending")}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                status === "pending"
                  ? "bg-blue-600 text-white shadow-md font-medium"
                  : "bg-white text-black border border-black hover:bg-gray-50 hover:shadow font-medium"
              }`}
            >
              รอการอนุมัติ
            </button>
            <button
              onClick={() => handleStatusChange("approved")}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                status === "approved"
                  ? "bg-blue-600 text-white shadow-md font-medium"
                  : "bg-white text-black border border-black hover:bg-gray-50 hover:shadow font-medium"
              }`}
            >
              อนุมัติแล้ว
            </button>
            <button
              onClick={() => handleStatusChange("rejected")}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-300 ${
                status === "rejected"
                  ? "bg-blue-600 text-white shadow-md font-medium"
                  : "bg-white text-black border border-black hover:bg-gray-50 hover:shadow font-medium"
              }`}
            >
              ปฏิเสธแล้ว
            </button>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <form onSubmit={handleSearch} className="flex w-full max-w-md">
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสสมาชิกหรือชื่อบริษัท"
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
            >
              ค้นหา
            </button>
          </form>
        </motion.div>

        {/* Debug Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mb-4"
        >
          <a
            href="/api/admin/address-update/debug"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm inline-flex items-center"
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
        </motion.div>

        {loading ? (
          <motion.div
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </motion.div>
        ) : requests.length === 0 ? (
          <motion.div
            className="bg-white rounded-lg shadow-md p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-black font-medium">
              ไม่พบคำขอแก้ไขที่อยู่ที่มีสถานะ {getStatusName(status)}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Request List */}
              <div className="lg:col-span-1 space-y-4">
                <RequestList
                  requests={requests}
                  selectedRequestId={selectedRequest?.id}
                  onViewRequest={handleViewRequest}
                />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div
                    className="flex justify-center items-center mt-4 bg-white p-3 rounded-lg shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 mx-1 rounded-md ${pagination.page === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      «
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1 mx-1 rounded-md ${pagination.page === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      ‹
                    </button>

                    <div className="mx-2 text-sm">
                      <span className="font-medium">{pagination.page}</span> /{" "}
                      {pagination.totalPages}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 mx-1 rounded-md ${pagination.page === pagination.totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      ›
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-3 py-1 mx-1 rounded-md ${pagination.page === pagination.totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      »
                    </button>
                  </motion.div>
                )}

                {/* Results Summary */}
                <motion.div
                  className="text-sm text-gray-500 text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  แสดง {requests.length} รายการ จากทั้งหมด {pagination.total} รายการ
                </motion.div>
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
            </motion.div>
          </>
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
