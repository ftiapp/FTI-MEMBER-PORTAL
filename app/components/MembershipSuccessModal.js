'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function MembershipSuccessModal({ 
  isOpen, 
  onClose, 
  membershipType, 
  memberData, 
  onConfirm 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => {
      onConfirm();
    }, 300);
  };

  const getMembershipTypeName = (type) => {
    const typeNames = {
      'oc': 'สมาชิกสามัญ-โรงงาน (OC)',
      'ac': 'สมาชิกสมทบ-นิติบุคคล (AC)', 
      'ic': 'สมาชิกสมทบ-บุคคลธรรมดา (IC)',
      'am': 'สมาชิกสามัญ-สมาคมการค้า (AM)'
    };
    return typeNames[type?.toLowerCase()] || 'สมาชิก';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="mt-4 text-center text-2xl font-bold text-white">
              สมัครสมาชิกสำเร็จ!
            </h2>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <div className="text-center">
              <p className="text-lg text-gray-800 mb-6">
                ท่านได้ทำการสมัคร<span className="font-semibold text-green-600">{getMembershipTypeName(membershipType)}</span>สำเร็จ
              </p>
              
              {/* Member Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-3">รายละเอียดการสมัคร:</h3>
                
                {memberData?.taxId && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">เลขประจำตัวผู้เสียภาษี: </span>
                    <span className="font-mono text-sm font-medium">{memberData.taxId}</span>
                  </div>
                )}
                
                {memberData?.idCard && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">เลขบัตรประชาชน: </span>
                    <span className="font-mono text-sm font-medium">{memberData.idCard}</span>
                  </div>
                )}
                
                {memberData?.companyNameTh && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">ชื่อบริษัท (ไทย): </span>
                    <span className="text-sm font-medium">{memberData.companyNameTh}</span>
                  </div>
                )}
                
                {memberData?.companyNameEn && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">ชื่อบริษัท (อังกฤษ): </span>
                    <span className="text-sm font-medium">{memberData.companyNameEn}</span>
                  </div>
                )}
                
                {memberData?.applicantName && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">ชื่อผู้สมัคร: </span>
                    <span className="text-sm font-medium">{memberData.applicantName}</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      ท่านสามารถตรวจสอบข้อมูลใบสมัครอีกครั้งได้ที่:
                    </p>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">แดชบอร์ด</span> → <span className="font-medium">เอกสารสมัครสมาชิก</span> → <span className="font-medium">เอกสารสมัครสมาชิก</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4">
            <button
              onClick={handleConfirm}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              รับทราบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

MembershipSuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  membershipType: PropTypes.string.isRequired,
  memberData: PropTypes.shape({
    taxId: PropTypes.string,
    idCard: PropTypes.string,
    companyNameTh: PropTypes.string,
    companyNameEn: PropTypes.string,
    applicantName: PropTypes.string
  }),
  onConfirm: PropTypes.func.isRequired
};

MembershipSuccessModal.defaultProps = {
  memberData: {}
};
