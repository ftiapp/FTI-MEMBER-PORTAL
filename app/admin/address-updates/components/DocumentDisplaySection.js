"use client";

import { getDocumentType } from "./addressUtils";

export default function DocumentDisplaySection({ selectedRequest, onPreviewOpen }) {
  if (!(selectedRequest.addr_code === "001" || selectedRequest.addr_code === "003")) {
    return null;
  }

  return (
    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">เอกสารแนบ</h3>
          <p className="text-sm text-gray-600">เอกสารที่ใช้สนับสนุนการแก้ไขที่อยู่</p>
        </div>
      </div>

      {selectedRequest.document_url ? (
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">ประเภทเอกสาร</p>
                <p className="font-semibold text-gray-900">{getDocumentType(selectedRequest.addr_code)}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <a
                  href={selectedRequest.document_url}
                  onClick={(e) => {
                    e.preventDefault();
                    onPreviewOpen(selectedRequest.document_url);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 inline-flex items-center gap-2 shadow-sm transition-all duration-200 transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span className="font-medium">ดูเอกสาร</span>
                </a>
                
                <a
                  href={selectedRequest.document_url}
                  download
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 inline-flex items-center gap-2 shadow-sm transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="font-medium">ดาวน์โหลด</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-red-800">ไม่พบเอกสารแนบ</p>
              <p className="text-sm text-red-600 mt-1">กรุณาตรวจสอบว่ามีเอกสารที่จำเป็นสำหรับการแก้ไขที่อยู่</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
