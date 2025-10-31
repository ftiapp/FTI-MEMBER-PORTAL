"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";
import ResubmitSuccessModal from "./ResubmitSuccessModal";
import ResubmitModal from "./ResubmitModal";
import ConfirmationModal from "./ConfirmationModal";

export default function RejectedActions({ rejectionId, membershipType, status, formData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResubmitConfirm, setShowResubmitConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Hide action buttons if status is resolved (แก้ไขแล้ว)
  const isResolved = status === "resolved" || status === "แก้ไขแล้ว";

  const handleResubmitClick = () => {
    setShowResubmitConfirm(true);
  };

  const handleResubmitConfirm = async (userMessage) => {
    setShowResubmitConfirm(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/membership/rejected-applications/${rejectionId}/resubmit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formData: formData,
            userComment: userMessage,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        toast.error("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Error resubmitting:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งใบสมัครใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/dashboard?tab=membership");
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    setShowCancelConfirm(false);

    try {
      const response = await fetch(`/api/membership/rejected-applications/${rejectionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("ยกเลิกใบสมัครเรียบร้อยแล้ว");
        router.push("/dashboard?tab=membership");
      } else {
        toast.error("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("Error cancelling:", error);
      toast.error("เกิดข้อผิดพลาดในการยกเลิกใบสมัคร");
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isSubmitting} message="กำลังส่งใบสมัครใหม่..." />

      {/* Success Modal */}
      <ResubmitSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        membershipType={membershipType}
      />

      {/* Resubmit Confirmation Modal */}
      <ResubmitModal
        isOpen={showResubmitConfirm}
        onConfirm={handleResubmitConfirm}
        onCancel={() => setShowResubmitConfirm(false)}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        title="ยืนยันการยกเลิกใบสมัคร"
        message="คุณแน่ใจหรือไม่ที่จะยกเลิกใบสมัครนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmText="ยกเลิกใบสมัคร"
        cancelText="ปิด"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelConfirm(false)}
        isDangerous={true}
      />

      <div className="flex gap-4 justify-end mt-6">
        <button
          onClick={() => router.push("/dashboard?tab=membership")}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ย้อนกลับ
        </button>

        {!isResolved && (
          <>
            <button
              onClick={handleCancelClick}
              disabled={isSubmitting}
              className="px-6 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิกใบสมัคร
            </button>

            <button
              onClick={handleResubmitClick}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังส่ง..." : "ส่งใบสมัครใหม่"}
            </button>
          </>
        )}

        {isResolved && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
            ✓ แก้ไขแล้ว
          </div>
        )}
      </div>
    </>
  );
}
