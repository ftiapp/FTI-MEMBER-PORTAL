'use client';

export default function VerificationStatusDisplay({ status }) {
  const { isLoading, submitted, approved, rejected, rejectReason } = status;

  // Show loading state while fetching verification status
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">ยืนยันตัวตนสมาชิกเดิม</h2>
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Show success message if verification is submitted and pending
  if (submitted && !approved && !rejected) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">ยืนยันตัวตนสมาชิกเดิม</h2>
        <div className="bg-blue-50 rounded-xl shadow-md p-6 border border-blue-200">
          <h3 className="text-lg font-medium text-blue-800">ท่านได้ทำการยืนยันตัวตนสมาชิกเดิมเสร็จสิ้นแล้ว</h3>
          <p className="mt-2 text-sm text-blue-700">
            กรุณารอ 1-2 วันทำการ ท่านจะได้รับการแจ้งเตือนผ่านอีเมลเมื่อการยืนยันตัวตนเสร็จสมบูรณ์
          </p>
        </div>
      </div>
    );
  }

  // Show approved message if verification is approved
  if (approved) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">ยืนยันตัวตนสมาชิกเดิม</h2>
        <div className="bg-green-50 rounded-xl shadow-md p-6 border border-green-200">
          <h3 className="text-lg font-medium text-green-800">การยืนยันตัวตนสมาชิกเดิมได้รับการอนุมัติแล้ว</h3>
          <p className="mt-2 text-sm text-green-700">
            ขอบคุณที่ทำการยืนยันตัวตน ท่านสามารถใช้งานระบบได้เต็มรูปแบบแล้ว
          </p>
        </div>
      </div>
    );
  }

  // Show rejected message if verification is rejected
  if (rejected) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">ยืนยันตัวตนสมาชิกเดิม</h2>
        <div className="bg-red-50 rounded-xl shadow-md p-6 border border-red-200">
          <h3 className="text-lg font-medium text-red-800">การยืนยันตัวตนสมาชิกเดิมถูกปฏิเสธ</h3>
          <p className="mt-2 text-sm text-red-700">
            เหตุผล: {rejectReason || 'ไม่ระบุเหตุผล'}
          </p>
          <p className="mt-2 text-sm text-red-700">
            กรุณาติดต่อเจ้าหน้าที่เพื่อขอข้อมูลเพิ่มเติม
          </p>
        </div>
      </div>
    );
  }

  // Default return null if none of the conditions match
  return null;
}
