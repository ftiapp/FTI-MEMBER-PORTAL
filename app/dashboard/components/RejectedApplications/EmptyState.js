"use client";

export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="flex flex-col items-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-gray-400"
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีใบสมัครที่ถูกปฏิเสธ</h3>
        <p className="text-gray-600 text-center">เมื่อมีใบสมัครที่ถูกปฏิเสธ จะแสดงที่นี่</p>
      </div>
    </div>
  );
}
