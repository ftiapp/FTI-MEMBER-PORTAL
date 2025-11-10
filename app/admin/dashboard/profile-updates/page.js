"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { RequestList, RequestDetail, RejectReasonModal } from "./components";
import { getStatusName } from "./utils/formatters";
import { useProfileUpdateRequests } from "./hooks/useProfileUpdateRequests";

export default function ProfileUpdatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "pending";

  // Use the optimized hook for profile update requests
  const {
    requests,
    loading,
    status,
    isProcessing,
    handleStatusChange: changeStatus,
    approveRequest,
    rejectRequest,
  } = useProfileUpdateRequests(initialStatus);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editedRequest, setEditedRequest] = useState(null);
  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleStatusChange = (newStatus) => {
    router.push(`/admin/dashboard/profile-updates?status=${newStatus}`);
    changeStatus(newStatus);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setEditedRequest(request);
    setComment("");
    setRejectReason("");
  };

  const handleApprove = async () => {
    if (!selectedRequest || !editedRequest) return;

    const success = await approveRequest(
      selectedRequest.id,
      comment,
      editedRequest.new_firstname,
      editedRequest.new_lastname,
    );

    if (success) {
      setSelectedRequest(null);
    }
  };

  const handleUpdateNewName = (field, value) => {
    if (!editedRequest) return;

    setEditedRequest((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason) {
      toast.error("กรุณาระบุเหตุผลในการปฏิเสธ");
      return;
    }

    const success = await rejectRequest(selectedRequest.id, rejectReason, comment);

    if (success) {
      setSelectedRequest(null);
      setShowRejectModal(false);
    }
  };

  // Count requests by status for cards
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-7 h-7 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            คำขอแก้ไขข้อมูลสมาชิก
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            จัดการคำขอแก้ไขข้อมูลส่วนตัวของสมาชิก
          </p>
        </div>

        {/* Status Cards */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              status === "pending"
                ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => handleStatusChange("pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  รอการอนุมัติ
                </div>
                <div className="text-3xl font-bold text-gray-900">{status === "pending" ? requests.length : pendingCount}</div>
              </div>
              <div className={`p-3 rounded-full ${status === "pending" ? "bg-yellow-400" : "bg-gray-200"}`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              status === "approved"
                ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => handleStatusChange("approved")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  อนุมัติแล้ว
                </div>
                <div className="text-3xl font-bold text-gray-900">{status === "approved" ? requests.length : approvedCount}</div>
              </div>
              <div className={`p-3 rounded-full ${status === "approved" ? "bg-green-500" : "bg-gray-200"}`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              status === "rejected"
                ? "border-red-400 bg-gradient-to-br from-red-50 to-rose-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
            }`}
            onClick={() => handleStatusChange("rejected")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ปฏิเสธแล้ว
                </div>
                <div className="text-3xl font-bold text-gray-900">{status === "rejected" ? requests.length : rejectedCount}</div>
              </div>
              <div className={`p-3 rounded-full ${status === "rejected" ? "bg-red-500" : "bg-gray-200"}`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switch - Improved design */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              รอการอนุมัติ
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              อนุมัติแล้ว
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ปฏิเสธแล้ว
            </div>
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#1e3a8a]"></div>
            <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 font-medium text-lg">
              ไม่พบคำขอแก้ไขข้อมูลที่มีสถานะ {getStatusName(status)}
            </p>
            <p className="text-gray-500 text-sm mt-1">ลองเลือกสถานะอื่นเพื่อดูคำขอที่มีอยู่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request List */}
            <RequestList
              requests={requests}
              loading={loading}
              status={status}
              selectedId={selectedRequest?.id}
              onStatusChange={handleStatusChange}
              onSelectRequest={handleViewRequest}
            />

            {/* Request Detail */}
            {selectedRequest && (
              <RequestDetail
                selectedRequest={selectedRequest}
                editedRequest={editedRequest}
                comment={comment}
                setComment={setComment}
                onUpdateNewName={handleUpdateNewName}
                onApprove={handleApprove}
                onReject={() => setShowRejectModal(true)}
                isProcessing={isProcessing}
              />
            )}
          </div>
        )}
      </motion.div>

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isVisible={showRejectModal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onCancel={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isProcessing={isProcessing}
      />
    </AdminLayout>
  );
}