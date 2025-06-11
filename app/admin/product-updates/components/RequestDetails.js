'use client';

import { useState } from 'react';
import { formatDate, formatStatus, getStatusColor } from '../utils/formatters';
import ProductComparison from './ProductComparison';

/**
 * Component for displaying product update request details
 * @param {Object} props - Component props
 * @param {Object} props.request - Request data
 * @param {Function} props.onApprove - Function to call when request is approved
 * @param {Function} props.onReject - Function to call when request is rejected
 * @param {Function} props.onClose - Function to call when details are closed
 * @returns {JSX.Element} - Request details component
 */
export default function RequestDetails({ request, onApprove, onReject, onClose }) {
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle approve request
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(request.id, adminNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject request
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธคำขอ');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(request.id, rejectReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // No need for product edit handling as admin will update in ERP system

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">รายละเอียดคำขอแก้ไขข้อมูลสินค้า</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">รหัสสมาชิก</p>
              <p className="font-medium">{request.member_code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ชื่อบริษัท</p>
              <p className="font-medium">{request.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ผู้ขอแก้ไข</p>
              <p className="font-medium">{request.user_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">อีเมล</p>
              <p className="font-medium">{request.user_email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">วันที่ขอแก้ไข</p>
              <p className="font-medium">{formatDate(request.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">สถานะ</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {formatStatus(request.status)}
              </span>
            </div>
          </div>

          <ProductComparison
            oldProducts={request.old_products}
            newProducts={request.new_products}
          />

          {request.status === 'pending' && (
            <div className="mt-6 border-t pt-4">
              {!showRejectForm ? (
                <>
                  <div className="mb-4">
                    <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 mb-1">
                      หมายเหตุ (ไม่บังคับ)
                    </label>
                    <textarea
                      id="admin-notes"
                      rows="3"
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="เพิ่มหมายเหตุเกี่ยวกับการอนุมัติ"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
                      disabled={isSubmitting}
                    >
                      ปฏิเสธคำขอ
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติคำขอ'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-1">
                      เหตุผลในการปฏิเสธ <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="reject-reason"
                      rows="3"
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="ระบุเหตุผลในการปฏิเสธคำขอ"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {request.status === 'approved' && request.admin_notes && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium mb-2">หมายเหตุจากผู้ดูแลระบบ</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.admin_notes}</p>
            </div>
          )}

          {request.status === 'rejected' && request.reject_reason && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium mb-2 text-red-600">เหตุผลในการปฏิเสธ</h3>
              <p className="text-gray-700 bg-red-50 p-3 rounded">{request.reject_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
