"use client";

export default function PreviewModal({ preview, onClose }) {
  if (!preview.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative bg-white w-full h-[85vh] max-w-6xl rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <span className="font-medium">ตัวอย่างเอกสาร</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white bg-opacity-20 ml-2">
                {preview.type.toUpperCase() || "FILE"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={preview.url}
              download
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm inline-flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              <span className="font-medium">ดาวน์โหลด</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>ปิด</span>
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="w-full h-full pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
          {preview.type === "pdf" && (
            <div className="w-full h-full">
              <iframe 
                src={preview.url} 
                className="w-full h-full border-0" 
                title="PDF Preview"
              />
            </div>
          )}
          {preview.type === "image" && (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <img
                src={preview.url}
                alt="preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          {preview.type === "unknown" && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md">
                <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่สามารถแสดงตัวอย่างไฟล์นี้ได้</h3>
                <p className="text-gray-600 mb-4">กรุณาดาวน์โหลดไฟล์เพื่อดูเนื้อหา</p>
                <a
                  href={preview.url}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 10l5 5m0 0l5-5m-5 5V4"
                    />
                  </svg>
                  <span>ดาวน์โหลดไฟล์</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
