import React from "react";

const SaveModal = ({ isOpen, status, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              กำลังบันทึกข้อมูล...
            </h3>
            <p className="text-gray-600">กรุณารอสักครู่</p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <svg
                  className="w-16 h-16 text-green-600"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              บันทึกข้อมูลสำเร็จ!
            </h3>
            <p className="text-gray-600 mb-6">
              ข้อมูลของคุณได้รับการบันทึกเรียบร้อยแล้ว
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ตรวจสอบข้อมูล
            </button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <svg
                  className="w-16 h-16 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-gray-600 mb-6">
              ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveModal;
