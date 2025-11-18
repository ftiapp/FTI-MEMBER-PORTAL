"use client";

export default function HelpSection() {
  return (
    <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-medium text-gray-900">ต้องการความช่วยเหลือ?</h3>
            <p className="text-gray-600 text-sm">หากมีปัญหาหรือสงสัยเรื่องการสมัครสมาชิก</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex items-center space-x-2 w-full sm:w-auto justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 3 6V5z"
            />
          </svg>
          <span>ติดต่อเรา</span>
        </button>
      </div>
    </div>
  );
}
