"use client";

import { useState } from "react";

export default function RejectReasonModal({ onReject, onClose }) {
  const [rejectReason, setRejectReason] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const handleReject = async () => {
    if (onReject && rejectReason.trim()) {
      setIsRejecting(true);
      try {
        await onReject(rejectReason, adminComment);
      } catch (error) {
        console.error("Error rejecting member:", error);
      } finally {
        setIsRejecting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e3a8a] bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <div className="px-6 py-4 border-b border-[#1e3a8a] border-opacity-20 bg-[#1e3a8a] text-white">
          <h3 className="text-lg font-semibold">ระบุเหตุผลการปฏิเสธ</h3>
        </div>

        <div className="p-6">
          <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
            เหตุผลที่ปฏิเสธ <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
            rows="3"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="ระบุเหตุผลที่ปฏิเสธ (จะแสดงให้สมาชิกเห็น)"
            required
          />

          <label
            htmlFor="adminComment"
            className="block text-sm font-medium text-gray-700 mt-4 mb-2"
          >
            ความคิดเห็นเพิ่มเติม (ไม่บังคับ)
          </label>
          <textarea
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
            rows="2"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="ใส่ความคิดเห็นเพิ่มเติม (จะแสดงให้สมาชิกเห็น)"
          />

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-[#1e3a8a] border border-[#1e3a8a] border-opacity-20 rounded-md hover:bg-[#1e3a8a] hover:bg-opacity-5 transition-colors font-medium shadow-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim() || isRejecting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                rejectReason.trim() && !isRejecting
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-300 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              {isRejecting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังดำเนินการ...
                </>
              ) : (
                "ยืนยันการปฏิเสธ"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
