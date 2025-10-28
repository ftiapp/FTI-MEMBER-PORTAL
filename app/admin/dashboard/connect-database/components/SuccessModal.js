function SuccessModal({ isOpen, onClose, memberCode, companyName }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <div className="flex items-center mb-4">
          <svg
            className="h-6 w-6 text-green-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">เชื่อมต่อเรียบร้อยแล้ว</h3>
        </div>
        <div className="space-y-2 text-gray-800">
          <div>
            <span className="font-bold">หมายเลขสมาชิก:</span> {memberCode}
          </div>
          <div>
            <span className="font-bold">ชื่อบริษัท:</span> {companyName}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            กรุณาแจ้งผู้ใช้งานให้ตรวจสอบในระบบของผู้ใช้งาน ที่เมนู{" "}
            <span className="font-semibold">ข้อมูลสมาชิก</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
