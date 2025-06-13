'use client';

import { useState } from 'react';
import { formatDate, formatStatus, getStatusColor } from '../utils/formatters';
import ProductComparison from './ProductComparison';
import { FiX, FiCheck, FiXCircle } from 'react-icons/fi';

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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">รายละเอียดคำขอแก้ไขข้อมูลสินค้า</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">รหัสสมาชิก</p>
              <p className="font-medium text-gray-900">{request.member_code}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">ชื่อบริษัท</p>
              <p className="font-medium text-gray-900">{request.company_name}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">ผู้ขอแก้ไข</p>
              <p className="font-medium text-gray-900">{request.user_name || '-'}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">อีเมล</p>
              <p className="font-medium text-gray-900">{request.user_email || '-'}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">วันที่ขอแก้ไข</p>
              <p className="font-medium text-gray-900">{formatDate(request.created_at)}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">สถานะ</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {formatStatus(request.status)}
              </span>
            </div>
          </div>

          <ProductComparison
            oldProducts={request.old_products}
            newProducts={request.new_products}
          />

          {request.status === 'pending' && (
            <div className="mt-8 border-t pt-6">
              {!showRejectForm ? (
                <>
                  <div className="mb-5">
                    <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 mb-2">
                      หมายเหตุ (ไม่บังคับ)
                    </label>
                    <textarea
                      id="admin-notes"
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="เพิ่มหมายเหตุเกี่ยวกับการอนุมัติ"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors focus:ring-2 focus:ring-red-300"
                      disabled={isSubmitting}
                    >
                      <FiXCircle className="w-4 h-4" /> ปฏิเสธคำขอ
                    </button>
                    <button
                      onClick={handleApprove}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors focus:ring-2 focus:ring-green-300"
                      disabled={isSubmitting}
                    >
                      <FiCheck className="w-4 h-4" /> {isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติคำขอ'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5">
                    <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-2">
                      เหตุผลในการปฏิเสธ <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="reject-reason"
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="ระบุเหตุผลในการปฏิเสธคำขอ"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors focus:ring-2 focus:ring-gray-200"
                      disabled={isSubmitting}
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleReject}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors focus:ring-2 focus:ring-red-300"
                      disabled={isSubmitting}
                    >
                      <FiXCircle className="w-4 h-4" /> {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {request.status === 'approved' && request.admin_notes && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium mb-3 text-gray-800 flex items-center gap-2">
                <FiCheck className="text-green-600" /> หมายเหตุจากผู้ดูแลระบบ
              </h3>
              <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-100">{request.admin_notes}</p>
            </div>
          )}

          {request.status === 'rejected' && request.reject_reason && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium mb-3 text-red-600 flex items-center gap-2">
                <FiXCircle className="text-red-600" /> เหตุผลในการปฏิเสธ
              </h3>
              <p className="text-gray-700 bg-red-50 p-4 rounded-lg border border-red-100">{request.reject_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
