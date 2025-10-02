"use client";

import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function RejectReasonModal({
  isVisible,
  rejectReason,
  setRejectReason,
  onCancel,
  onConfirm,
  isProcessing,
}) {
  if (!isVisible) return null;

  const handleConfirm = () => {
    if (!rejectReason.trim()) {
      toast.error("กรุณาระบุเหตุผลในการปฏิเสธ");
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3 className="text-lg font-medium text-navy-800 mb-4">ระบุเหตุผลในการปฏิเสธ</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="rejectReason" className="block text-sm font-medium text-navy-700 mb-1">
              เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejectReason"
              rows="3"
              className="w-full px-3 py-2 border border-black rounded-md focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
              placeholder="ระบุเหตุผลในการปฏิเสธคำขอแก้ไขข้อมูล"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
          </div>

          <div className="flex space-x-3 justify-end">
            <motion.button
              onClick={onCancel}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ยกเลิก
            </motion.button>

            <motion.button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isProcessing ? "กำลังดำเนินการ..." : "ยืนยันการปฏิเสธ"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
