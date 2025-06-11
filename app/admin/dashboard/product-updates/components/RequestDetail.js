'use client';

import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function RequestDetail({
  request,
  adminNotes,
  setAdminNotes,
  onApprove,
  onReject,
  isProcessing
}) {
  if (!request) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    return format(new Date(dateString), 'PPp', { locale: th });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">รายละเอียดคำขอ</h2>
        <div>
          {request.status === 'pending' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              รอดำเนินการ
            </span>
          )}
          {request.status === 'approved' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              อนุมัติแล้ว
            </span>
          )}
          {request.status === 'rejected' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              ปฏิเสธแล้ว
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">ข้อมูลสมาชิก</h3>
          <p className="font-medium">{request.member_name || 'ไม่ระบุชื่อ'}</p>
          <p className="text-sm">{request.email || 'ไม่ระบุอีเมล'}</p>
          <p className="text-sm">{request.phone || 'ไม่ระบุเบอร์โทร'}</p>
          <p className="text-sm text-gray-500 mt-1">รหัสสมาชิก: {request.member_id || 'ไม่ระบุ'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">ข้อมูลคำขอ</h3>
          <p className="text-sm">วันที่ส่งคำขอ: {formatDate(request.created_at)}</p>
          {request.status !== 'pending' && (
            <>
              <p className="text-sm">วันที่ดำเนินการ: {formatDate(request.updated_at)}</p>
              <p className="text-sm">ดำเนินการโดย: {request.admin_name || 'ไม่ระบุ'}</p>
            </>
          )}
        </div>
      </div>

      <hr className="my-4 border-t border-gray-200" />

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">รายละเอียดการเปลี่ยนแปลงสินค้า/บริการ</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <pre className="whitespace-pre-wrap text-sm">{request.product_details || 'ไม่มีรายละเอียด'}</pre>
        </div>
      </div>

      {request.old_product && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">สินค้า/บริการเดิม</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{request.old_product}</pre>
          </div>
        </div>
      )}

      {request.new_product && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">สินค้า/บริการใหม่</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{request.new_product}</pre>
          </div>
        </div>
      )}

      {request.status === 'rejected' && request.reject_reason && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">เหตุผลที่ปฏิเสธ</h3>
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{request.reject_reason}</p>
          </div>
        </div>
      )}

      {request.admin_notes && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">บันทึกของผู้ดูแลระบบ</h3>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm">{request.admin_notes}</p>
          </div>
        </div>
      )}

      {request.status === 'pending' && (
        <>
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">บันทึกของผู้ดูแลระบบ</h3>
            <textarea
              placeholder="เพิ่มบันทึกหรือหมายเหตุ (ไม่จำเป็น)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onReject}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              ปฏิเสธคำขอ
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isProcessing ? 'กำลังดำเนินการ...' : 'อนุมัติคำขอ'}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
