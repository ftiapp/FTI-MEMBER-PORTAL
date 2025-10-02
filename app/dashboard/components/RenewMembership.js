"use client";

import React from "react";

export default function RenewMembership() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">ยืนยันสมาชิกเดิม</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="text-lg font-medium">สถานะสมาชิกปัจจุบัน</h3>
              <p className="text-sm text-gray-500">หมดอายุวันที่ 31 ธ.ค. 2025</p>
            </div>
            <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full">สมาชิกสามัญ</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">ต่ออายุสมาชิก</h3>
            <p className="text-gray-600">
              ท่านสามารถต่ออายุสมาชิกได้ล่วงหน้า 60 วันก่อนวันหมดอายุ
              การต่ออายุสมาชิกจะช่วยให้ท่านได้รับสิทธิประโยชน์ต่างๆ อย่างต่อเนื่อง
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">ค่าต่ออายุสมาชิกสามัญ</h4>
                  <p className="text-sm text-gray-600">3,500 บาท / ปี</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                ต่ออายุสมาชิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
