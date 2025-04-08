'use client';

import React from 'react';

export default function Payment() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">ชำระค่าบริการ</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div className="pb-4 border-b">
            <h3 className="text-lg font-medium">รายการชำระเงิน</h3>
          </div>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-medium">ค่าสมาชิกสามัญประจำปี 2025</h4>
                  <p className="text-sm text-gray-500">วันที่ออกใบแจ้งหนี้: 15 ม.ค. 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">3,500.00 บาท</p>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">รอชำระเงิน</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-end">
                <button className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition-colors">
                  ชำระเงิน
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-6">ประวัติการชำระเงิน</h3>
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-medium">ค่าสมาชิกสามัญประจำปี 2024</h4>
                  <p className="text-sm text-gray-500">วันที่ชำระเงิน: 20 ม.ค. 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">3,500.00 บาท</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">ชำระแล้ว</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-end">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                  ดูใบเสร็จ
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-medium">ค่าสมาชิกสามัญประจำปี 2023</h4>
                  <p className="text-sm text-gray-500">วันที่ชำระเงิน: 15 ม.ค. 2023</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">3,500.00 บาท</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">ชำระแล้ว</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-end">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                  ดูใบเสร็จ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
