"use client";

import { useRouter } from "next/navigation";

/**
 * Draft Save Popup Component
 * คอมโพเนนต์แสดง popup เมื่อบันทึกร่างสำเร็จ
 * ใช้ร่วมกันระหว่าง AC, AM, IC, OC
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - เปิด/ปิด popup
 * @param {Function} props.onClose - ฟังก์ชันปิด popup
 * @param {string} props.membershipType - ประเภทสมาชิก (AC, AM, IC, OC)
 * @param {Object} props.displayInfo - ข้อมูลที่จะแสดง
 * @param {string} props.displayInfo.primaryId - ID หลัก (taxId, idCard)
 * @param {string} props.displayInfo.primaryName - ชื่อหลัก (companyName, associationName, fullName)
 * @param {string} props.displayInfo.primaryIdLabel - Label สำหรับ ID (เลขทะเบียนนิติบุคคล, เลขบัตรประชาชน, เลขประจำตัวผู้เสียภาษี)
 */
export default function DraftSavePopup({ isOpen, onClose, membershipType = "OC", displayInfo = {} }) {
  const router = useRouter();

  if (!isOpen) return null;

  const { primaryId, primaryName, primaryIdLabel } = displayInfo;

  const handleNavigateToDocuments = () => {
    router.push("/dashboard?tab=documents");
    onClose();
  };

  const handleNavigateToDashboard = () => {
    router.push("/dashboard");
    onClose();
  };

  // กำหนด label ตามประเภทสมาชิก
  const getDefaultIdLabel = () => {
    switch (membershipType) {
      case "IC":
        return "หมายเลขบัตรประชาชน";
      case "AM":
        return "เลขประจำตัวผู้เสียภาษี";
      case "AC":
      case "OC":
      default:
        return "หมายเลขทะเบียนนิติบุคคล";
    }
  };

  const idLabel = primaryIdLabel || getDefaultIdLabel();

  // กำหนดข้อความตามประเภทสมาชิก
  const getEntityType = () => {
    switch (membershipType) {
      case "IC":
        return "";
      case "AM":
        return "";
      case "AC":
      case "OC":
      default:
        return "ของบริษัท";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">บันทึกร่างสำเร็จ</h3>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              ท่านได้บันทึกร่างเอกสารสมัครสมาชิก{getEntityType()}
              {primaryName && (
                <span className="block font-medium text-gray-900 mt-1">{primaryName}</span>
              )}
              {primaryId && (
                <span className="block font-medium text-gray-900 mt-1">
                  {idLabel} {primaryId}
                </span>
              )}
              <span className="block mt-2">สำเร็จแล้ว</span>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              ท่านสามารถเปิดเอกสารนี้อีกครั้ง โดยไปที่เมนู{" "}
              <button
                onClick={handleNavigateToDashboard}
                className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
              >
                จัดการสมาชิก
              </button>{" "}
              ทางด้านบน และเลือกเมนู{" "}
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
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
