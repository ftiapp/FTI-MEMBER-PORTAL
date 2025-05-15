'use client';

import React from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';

export default function RejectModal({
  rejectReason,
  setRejectReason,
  handleReject,
  setShowRejectModal,
  actionLoading,
  actionError
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">ปฏิเสธคำขอ</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowRejectModal(false)}
            disabled={actionLoading}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">เหตุผลในการปฏิเสธ</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 h-32"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="ระบุเหตุผลในการปฏิเสธคำขอ..."
            disabled={actionLoading}
          />
        </div>
        
        {actionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span>{actionError}</span>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            onClick={() => setShowRejectModal(false)}
            disabled={actionLoading}
          >
            ยกเลิก
          </button>
          
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaTimes className="mr-2" />}
            ปฏิเสธคำขอ
          </button>
        </div>
      </div>
    </div>
  );
}
