import React from 'react';

const ApprovalModal = ({ 
  isOpen,
  onClose,
  onConfirm, 
  isSubmitting,
  applicationData
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">ยืนยันการอนุมัติ</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            คุณต้องการอนุมัติการสมัครสมาชิกนี้หรือไม่?
          </p>
          
          {applicationData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ประเภทสมาชิก:</span>
                <span className="text-sm font-medium">{applicationData.memberType}</span>
              </div>
              {applicationData.companyName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ชื่อบริษัท/องค์กร:</span>
                  <span className="text-sm font-medium">{applicationData.companyName}</span>
                </div>
              )}
              {applicationData.taxId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">เลขประจำตัวผู้เสียภาษี:</span>
                  <span className="text-sm font-medium">{applicationData.taxId}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">หมายเหตุ:</p>
                <p className="text-sm text-yellow-700">
                  การอนุมัติจะไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนดำเนินการ
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังดำเนินการ...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                ยืนยันการอนุมัติ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
