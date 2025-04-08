'use client';

import React from 'react';

export default function ContactUs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">ติดต่อเรา</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div className="pb-4 border-b">
            <h3 className="text-lg font-medium">ส่งข้อความถึงเรา</h3>
            <p className="text-sm text-gray-500 mt-1">หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือ สามารถส่งข้อความถึงเราได้</p>
          </div>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ</label>
              <input
                type="text"
                id="subject"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="หัวข้อ"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">ข้อความ</label>
              <textarea
                id="message"
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="รายละเอียด"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                ส่งข้อความ
              </button>
            </div>
          </form>
          
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">ช่องทางการติดต่อ</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">โทรศัพท์</h4>
                  <p className="text-gray-600">02-345-1000</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">อีเมล</h4>
                  <p className="text-gray-600">contact@fti.or.th</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">ที่อยู่</h4>
                  <p className="text-gray-600">
                    สภาอุตสาหกรรมแห่งประเทศไทย<br />
                    เลขที่ 123 ถนนรัชดาภิเษก แขวงดินแดง<br />
                    เขตดินแดง กรุงเทพฯ 10400
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">เวลาทำการ</h4>
                  <p className="text-gray-600">
                    จันทร์ - ศุกร์: 08:30 - 17:30 น.<br />
                    เสาร์ - อาทิตย์: ปิดทำการ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
