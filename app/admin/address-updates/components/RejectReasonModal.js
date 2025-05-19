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
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={onCancel}
          />
          
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-10"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">ระบุเหตุผลในการปฏิเสธ</h3>
            
            <div className="mb-4">
              <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-1">
                เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectReason"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="กรุณาระบุเหตุผลในการปฏิเสธคำขอแก้ไขที่อยู่"
              />
              {rejectReason.trim() === '' && (
                <p className="mt-1 text-sm text-red-600">กรุณาระบุเหตุผลในการปฏิเสธ</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-1">
                บันทึกช่วยจำ (เฉพาะเจ้าหน้าที่)
              </label>
              <textarea
                id="adminNotes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50"
                rows="3"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="บันทึกช่วยจำสำหรับเจ้าหน้าที่ (เฉพาะแอดมินเท่านั้นที่จะเห็นข้อความนี้)"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium"
                onClick={onCancel}
                disabled={isProcessing}
              >
                ยกเลิก
              </button>
              
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium flex items-center justify-center disabled:opacity-50"
                onClick={onConfirm}
                disabled={isProcessing || rejectReason.trim() === ''}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  'ยืนยันการปฏิเสธ'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
