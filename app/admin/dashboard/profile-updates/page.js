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
            คำขอแก้ไขข้อมูลสมาชิก
          </motion.h1>

          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
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
              ไม่พบคำขอแก้ไขข้อมูลที่มีสถานะ {getStatusName(status)}
            </p>
          </motion.div>
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
