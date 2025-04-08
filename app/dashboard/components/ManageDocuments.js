'use client';

import React from 'react';

export default function ManageDocuments() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">จัดการเอกสาร</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <h3 className="font-medium">เอกสารของท่าน</h3>
            <button className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm">อัพโหลดเอกสาร</button>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-medium">หนังสือรับรองบริษัท</p>
                  <p className="text-sm text-gray-500">อัพโหลดเมื่อ 15 ม.ค. 2025</p>
                </div>
              </div>
              <button className="text-blue-700 hover:underline">ดาวน์โหลด</button>
            </div>
            <div className="p-4 border rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-medium">ภพ.20</p>
                  <p className="text-sm text-gray-500">อัพโหลดเมื่อ 15 ม.ค. 2025</p>
                </div>
              </div>
              <button className="text-blue-700 hover:underline">ดาวน์โหลด</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
