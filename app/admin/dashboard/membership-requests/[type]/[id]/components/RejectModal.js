import React from "react";

const RejectModal = ({
  showRejectModal,
  setShowRejectModal,
  rejectionReason,
  setRejectionReason,
  handleReject,
  isSubmitting,
}) => {
  if (!showRejectModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">ปฏิเสธการสมัครสมาชิก</h3>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="ระบุเหตุผลในการปฏิเสธ"
          ></textarea>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowRejectModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการปฏิเสธ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
