import React, { useState } from 'react';
import { formatThaiDateTime } from '../../ีutils/formatters';
import { STATUS, MEMBER_TYPES } from '../../ีutils/constants';
import ApprovalModal from '../modals/ApprovalModal';

const AdminActionsSection = ({ 
  application, 
  adminNote,
  onAdminNoteChange,
  onSaveNote,
  onApprove,
  onReject,
  onOpenRejectModal,
  isSubmitting,
  type // Add type prop to get membership type
}) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const handleApproveClick = () => {
    setShowApprovalModal(true);
  };

  const handleApprovalConfirm = () => {
    setShowApprovalModal(false);
    onApprove();
  };

  const handleApprovalCancel = () => {
    setShowApprovalModal(false);
  };

  // Get member type info
  const memberTypeInfo = MEMBER_TYPES[type] || { code: 'N/A', name: 'ไม่ทราบประเภท' };
  
  // Get company name based on membership type
  const getCompanyName = () => {
    if (application?.company_name_th) return application.company_name_th;
    if (application?.companyNameTh) return application.companyNameTh;
    if (application?.associationNameTh) return application.associationNameTh;
    if (application?.name) return application.name;
    return 'ไม่ระบุ';
  };

  // Get tax ID or ID card
  const getTaxIdOrIdCard = () => {
    if (application?.tax_id) return application.tax_id;
    if (application?.taxId) return application.taxId;
    if (application?.id_card_number) return application.id_card_number;
    if (application?.idCard) return application.idCard;
    return 'ไม่ระบุ';
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 mb-8 print:hidden">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 border-b border-blue-100 pb-4">
        การดำเนินการของผู้ดูแลระบบ
      </h3>
      
      {/* Admin Note */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-lg font-semibold text-gray-800">หมายเหตุของผู้ดูแลระบบ</label>
          {application?.adminNoteAt && (
            <span className="text-sm text-gray-500">
              บันทึกเมื่อ: {formatThaiDateTime(application.adminNoteAt)}
            </span>
          )}
        </div>
        <textarea
          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows="4"
          value={adminNote}
          onChange={(e) => onAdminNoteChange(e.target.value)}
          placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
          disabled={isSubmitting}
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={onSaveNote}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกหมายเหตุ'}
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      {application?.status === STATUS.PENDING && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={onOpenRejectModal}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
          </button>
          <button
            onClick={handleApproveClick}
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
      
      {/* Show Member Code if approved */}
      {application?.status === STATUS.APPROVED && application?.memberCode && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-lg font-semibold mb-2 text-green-800">หมายเลขสมาชิก</h4>
          <p className="text-xl font-bold text-green-700">{application.memberCode}</p>
          <p className="text-sm text-green-600 mt-1">เชื่อมต่อฐานข้อมูลสำเร็จแล้ว</p>
        </div>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={handleApprovalCancel}
        onConfirm={handleApprovalConfirm}
        isSubmitting={isSubmitting}
        applicationData={{
          memberType: `${memberTypeInfo.code} - ${memberTypeInfo.name}`,
          companyName: getCompanyName(),
          taxId: getTaxIdOrIdCard()
        }}
      />
    </div>
  );
};

export default AdminActionsSection;