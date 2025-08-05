'use client';

import { useRouter } from 'next/navigation';

export default function DraftSavePopup({ 
  isOpen, 
  onClose, 
  taxId, 
  associationName 
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNavigateToDashboard = () => {
    onClose();
    router.push('/dashboard');
  };

  const handleNavigateToDocuments = () => {
    onClose();
    router.push('/dashboard?tab=documents');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">บันทึกร่างสำเร็จ</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              ท่านได้บันทึกร่างเอกสารสมัครสมาชิกของ{associationName ? ` ${associationName}` : ''} สำเร็จแล้ว
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                {associationName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">ชื่อสมาคม:</span>
                    <span className="text-gray-900">{associationName}</span>
                  </div>
                )}
                {taxId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">เลขประจำตัวผู้เสียภาษี:</span>
                    <span className="text-gray-900 font-mono">{taxId}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              ท่านสามารถกลับมาแก้ไขข้อมูลได้ในภายหลัง โดยไปที่เมนู{' '}
              <button
                onClick={handleNavigateToDashboard}
                className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
              >
                จัดการสมาชิก
              </button>
              {' '}ทางด้านบน และเลือกเมนู{' '}
              <button
                onClick={handleNavigateToDocuments}
                className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
              >
                เอกสารสมัครสมาชิก
              </button>
            </p>
          
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleNavigateToDocuments}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              ไปที่เอกสารสมัครสมาชิก
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
