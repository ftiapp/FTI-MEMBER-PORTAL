'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function RejectReasonModal({
  isVisible,
  rejectReason,
  setRejectReason,
  adminNotes,
  setAdminNotes,
  onCancel,
  onConfirm,
  isProcessing
}) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">ระบุเหตุผลในการปฏิเสธคำขอ</h2>
            
            <p className="text-sm text-gray-500 mb-4">
              กรุณาระบุเหตุผลในการปฏิเสธคำขอเปลี่ยนสินค้า/บริการนี้ เหตุผลนี้จะถูกส่งไปยังสมาชิก
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">เหตุผลในการปฏิเสธ</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="ระบุเหตุผลในการปฏิเสธคำขอ"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">บันทึกของผู้ดูแลระบบ (ไม่จำเป็น)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="บันทึกเพิ่มเติมสำหรับผู้ดูแลระบบ"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!rejectReason.trim() || isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
