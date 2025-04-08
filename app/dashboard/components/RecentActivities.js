'use client';

import React from 'react';

export default function RecentActivities() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">กิจกรรมล่าสุด</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div className="pb-4 border-b">
            <h3 className="text-lg font-medium">กิจกรรมที่กำลังจะมาถึง</h3>
          </div>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-blue-100 text-blue-800 rounded-lg p-3 text-center min-w-[60px]">
                  <div className="text-xl font-bold">15</div>
                  <div className="text-sm">เม.ย.</div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">สัมมนาเทคโนโลยีการผลิตสมัยใหม่</h4>
                  <p className="text-sm text-gray-500 mt-1">09:00 - 16:00 น. ณ ห้องประชุมใหญ่ สภาอุตสาหกรรม</p>
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition-colors">
                      ลงทะเบียน
                    </button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      รายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-blue-100 text-blue-800 rounded-lg p-3 text-center min-w-[60px]">
                  <div className="text-xl font-bold">22</div>
                  <div className="text-sm">เม.ย.</div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">งานแสดงสินค้าอุตสาหกรรม 2025</h4>
                  <p className="text-sm text-gray-500 mt-1">10:00 - 18:00 น. ณ ศูนย์การประชุมแห่งชาติสิริกิติ์</p>
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition-colors">
                      ลงทะเบียน
                    </button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      รายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-4">กิจกรรมที่ผ่านมา</h3>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-gray-200 text-gray-700 rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-xl font-bold">10</div>
                    <div className="text-sm">มี.ค.</div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">การประชุมใหญ่สามัญประจำปี 2025</h4>
                    <p className="text-sm text-gray-500 mt-1">13:00 - 16:00 น. ณ ห้องประชุมใหญ่ สภาอุตสาหกรรม</p>
                    <div className="mt-3">
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                        ดูบันทึกการประชุม
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-gray-200 text-gray-700 rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-xl font-bold">25</div>
                    <div className="text-sm">ก.พ.</div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">สัมมนาการส่งออกสินค้าไปตลาดอาเซียน</h4>
                    <p className="text-sm text-gray-500 mt-1">09:30 - 15:30 น. ณ โรงแรมเซ็นทารา แกรนด์</p>
                    <div className="mt-3">
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                        ดูเอกสารประกอบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
