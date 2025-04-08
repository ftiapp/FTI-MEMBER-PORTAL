'use client';

import React from 'react';

export default function MemberInfo() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">ข้อมูลสมาชิก</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
              TS
            </div>
            <div>
              <h3 className="text-xl font-medium">บริษัท เทสต์ ซิสเต็มส์ จำกัด</h3>
              <p className="text-gray-500">สมาชิกสามัญ</p>
              <p className="text-sm text-gray-500">รหัสสมาชิก: FTI-12345</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-4">ข้อมูลบริษัท</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">ชื่อบริษัท</p>
                  <p>บริษัท เทสต์ ซิสเต็มส์ จำกัด</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">เลขทะเบียนนิติบุคคล</p>
                  <p>0123456789012</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ประเภทธุรกิจ</p>
                  <p>เทคโนโลยีสารสนเทศและการสื่อสาร</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ที่อยู่</p>
                  <p>123 อาคารเทสต์ ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">ข้อมูลการติดต่อ</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">ผู้ติดต่อหลัก</p>
                  <p>คุณทดสอบ ระบบงาน</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ตำแหน่ง</p>
                  <p>กรรมการผู้จัดการ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">อีเมล</p>
                  <p>test@testsystems.co.th</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                  <p>02-123-4567</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-lg font-medium mb-4">ข้อมูลสมาชิกภาพ</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">ประเภทสมาชิก</p>
                <p>สมาชิกสามัญ</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">วันที่เริ่มเป็นสมาชิก</p>
                <p>1 มกราคม 2023</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">วันที่หมดอายุ</p>
                <p>31 ธันวาคม 2025</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-500">สถานะ</p>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">ปกติ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
