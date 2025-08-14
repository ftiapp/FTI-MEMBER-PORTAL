import React from 'react';

const AdminActionsSection = ({ 
  application, 
  handleApprove, 
  handleReject, 
  handleSaveNote, 
  isSubmitting, 
  adminNote, 
  setAdminNote 
}) => {
  if (!application) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        การดำเนินการของผู้ดูแลระบบ
      </h3>
      
      {/* Admin Note */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-lg font-semibold text-gray-800">หมายเหตุของผู้ดูแลระบบ</label>
          {application.adminNoteAt && (
            <span className="text-sm text-gray-500">
              บันทึกเมื่อ: {new Date(application.adminNoteAt).toLocaleString('th-TH')}
            </span>
          )}
        </div>
        <textarea
          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows="4"
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleSaveNote}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมายเหตุ'}
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      {application.status === 0 && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleReject}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {isSubmitting ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
          </button>
        </div>
      )}
      
      {/* Show Member Code if available */}
      {application.status === 1 && application.member_code && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 text-green-800">หมายเลขสมาชิก</h4>
          <p className="text-xl font-bold text-green-700">{application.member_code}</p>
          <p className="text-sm text-green-600 mt-1">เชื่อมต่อฐานข้อมูลสำเร็จแล้ว</p>
        </div>
      )}
    </div>
  );
};

export default AdminActionsSection;
