'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import DraftApplications from './DraftApplications';

export default function UpgradeMembership() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      {/* Premium Membership Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* สน สามัญ-โรงงาน */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-blue-600 text-white p-4">
            <h3 className="text-lg font-semibold">สน สามัญ-โรงงาน</h3>
            <p className="text-sm opacity-90">สำหรับผู้ประกอบการภาคอุตสาหกรรมโรงงาน</p>
          </div>
          <div className="p-4">
            <p className="text-xl font-bold text-black mb-2">12,000 บาท/ปี</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                สิทธิในการเข้าร่วมประชุมใหญ่
              </li>
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                สิทธิในการออกเสียงเลือกตั้ง
              </li>
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                รับข้อมูลข่าวสารจากสภาอุตสาหกรรม
              </li>
            </ul>
            <Link
              href="/membership/oc"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors block text-center"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
        
        {/* สส สามัญ-สมาคมการค้า */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-purple-600 text-white p-4">
            <h3 className="text-lg font-semibold">สส สามัญ-สมาคมการค้า</h3>
            <p className="text-sm opacity-90">สำหรับสมาคมการค้าที่เกี่ยวข้องกับอุตสาหกรรม</p>
          </div>
          <div className="p-4">
            <p className="text-xl font-bold text-black mb-2">8,000 บาท/ปี</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                สิทธิในการเข้าร่วมประชุมใหญ่
              </li>
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                รับข้อมูลข่าวสารจากสภาอุตสาหกรรม
              </li>
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                เครือข่ายธุรกิจอุตสาหกรรม
              </li>
            </ul>
            <Link
              href="/membership/am"
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors block text-center"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>

      {/* Standard Membership Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ทน สมทบ-นิติบุคคล */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-green-600 text-white p-4">
            <h3 className="text-lg font-semibold">ทน สมทบ-นิติบุคคล</h3>
            <p className="text-sm opacity-90">สำหรับนิติบุคคลที่ทำงานด้านอุตสาหกรรม</p>
          </div>
          <div className="p-4">
            <p className="text-xl font-bold text-black mb-2">6,000 บาท/ปี</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                เข้าร่วมกิจกรรมของสภาอุตสาหกรรม
              </li>
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                รับข้อมูลข่าวสารจากสภาอุตสาหกรรม
              </li>
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                เครือข่ายธุรกิจอุตสาหกรรม
              </li>
            </ul>
            <Link
              href="/membership/ac"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors block text-center"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
        
        {/* ทบ สมทบ-บุคคลธรรมดา */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-amber-600 text-white p-4">
            <h3 className="text-lg font-semibold">ทบ สมทบ-บุคคลธรรมดา</h3>
            <p className="text-sm opacity-90">สำหรับบุคคลธรรมดาที่สนใจงานด้านอุตสาหกรรม</p>
          </div>
          <div className="p-4">
            <p className="text-xl font-bold text-black mb-2">3,000 บาท/ปี</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                เข้าร่วมกิจกรรมของสภาอุตสาหกรรม
              </li>
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                รับข้อมูลข่าวสารจากสภาอุตสาหกรรม
              </li>
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                เครือข่ายธุรกิจอุตสาหกรรม
              </li>
            </ul>
            <Link
              href="/membership/ic"
              className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors block text-center"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
      
      {/* Membership benefits comparison section */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-semibold mb-6 text-black">เปรียบเทียบสิทธิประโยชน์</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-black font-medium border-b">สิทธิประโยชน์</th>
                <th className="py-3 px-4 text-center text-amber-600 font-medium border-b">ทบ สมทบ-บุคคลธรรมดา</th>
                <th className="py-3 px-4 text-center text-green-600 font-medium border-b">ทน สมทบ-นิติบุคคล</th>
                <th className="py-3 px-4 text-center text-purple-600 font-medium border-b">สส สามัญ-สมาคมการค้า</th>
                <th className="py-3 px-4 text-center text-blue-600 font-medium border-b">สน สามัญ-โรงงาน</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-b text-black">รับข่าวสาร</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b text-black">เข้าร่วมกิจกรรมสาธารณะ</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b text-black">เครือข่ายธุรกิจอุตสาหกรรม</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b text-black">สิทธิเข้าร่วมประชุมใหญ่</td>
                <td className="py-3 px-4 text-center border-b text-black">-</td>
                <td className="py-3 px-4 text-center border-b text-black">-</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b text-black">สิทธิในการออกเสียงเลือกตั้ง</td>
                <td className="py-3 px-4 text-center border-b text-black">-</td>
                <td className="py-3 px-4 text-center border-b text-black">-</td>
                <td className="py-3 px-4 text-center border-b text-black">-</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 font-medium text-black">ค่าสมาชิกรายปี</td>
                <td className="py-3 px-4 text-center font-medium text-black">3,000 บาท</td>
                <td className="py-3 px-4 text-center font-medium text-black">6,000 บาท</td>
                <td className="py-3 px-4 text-center font-medium text-black">8,000 บาท</td>
                <td className="py-3 px-4 text-center font-medium text-black">12,000 บาท</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-semibold mb-6 text-black">คำถามที่พบบ่อย</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-black">ฉันสามารถเปลี่ยนประเภทสมาชิกได้ตลอดเวลาหรือไม่?</h4>
            <p className="mt-2 text-black">ท่านสามารถอัพเกรดประเภทสมาชิกได้ตลอดเวลา โดยจะมีผลทันทีหลังจากชำระค่าสมาชิก</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-black">สมาชิกแต่ละประเภทมีเงื่อนไขการสมัครต่างกันอย่างไร?</h4>
            <p className="mt-2 text-black">สมาชิกสามัญ-โรงงานต้องเป็นผู้ประกอบการในภาคอุตสาหกรรมโรงงาน สมาชิกสามัญ-สมาคมการค้าต้องเป็นสมาคมการค้าที่เกี่ยวข้องกับอุตสาหกรรม สมาชิกสมทบ-นิติบุคคลและสมาชิกสมทบ-บุคคลธรรมดาไม่จำเป็นต้องมีธุรกิจเป็นของตนเอง</p>
          </div>
        </div>
      </div>
    </div>
  );
}