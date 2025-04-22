'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function UpgradeMembership() {
  const { user } = useAuth();
  const [membershipType, setMembershipType] = useState('ทั่วไป'); // Default membership type
  
  // In a real implementation, you might fetch the current membership type
  useEffect(() => {
    // Example of how you might fetch the user's membership status
    if (user?.id) {
      // Fetch membership status from your API
      // This is just a placeholder
      const fetchMembershipStatus = async () => {
        try {
          // const response = await fetch(`/api/user/membership-status?userId=${user.id}`);
          // if (response.ok) {
          //   const data = await response.json();
          //   setMembershipType(data.membershipType || 'ทั่วไป');
          // }
        } catch (error) {
          console.error('Error fetching membership status:', error);
        }
      };
      
      fetchMembershipStatus();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-black">สถานะสมาชิกปัจจุบัน: <span className="text-blue-700">ประเภท{membershipType}</span></p>
            <p className="text-sm text-black">เลือกประเภทสมาชิกที่ต้องการอัพเกรด เพื่อรับสิทธิประโยชน์เพิ่มเติม</p>
          </div>
        </div>
      </div>
      
      {/* Premium Membership Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* สมาชิกสามัญ */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-blue-600 text-white p-4">
            <h3 className="text-lg font-semibold">สมาชิกสามัญ (สส)</h3>
            <p className="text-sm opacity-90">สำหรับผู้ประกอบการภาคอุตสาหกรรม</p>
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
              href={`/membership/upgrade?type=sn&name=${encodeURIComponent('สมาชิกสามัญ (สส)')}&fee=12000`}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors block text-center"
            >
              อัพเกรด
            </Link>
          </div>
        </div>
        
        {/* สมาชิกวิสามัญ */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-purple-600 text-white p-4">
            <h3 className="text-lg font-semibold">สมาชิกวิสามัญ (สน)</h3>
            <p className="text-sm opacity-90">สำหรับผู้ประกอบการที่เกี่ยวข้องกับอุตสาหกรรม</p>
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
              href={`/membership/upgrade?type=ss&name=${encodeURIComponent('สมาชิกวิสามัญ (สน)')}&fee=8000`}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors block text-center"
            >
              อัพเกรด
            </Link>
          </div>
        </div>
        
        {/* สมาชิกไม่มีนิติบุคคล */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-green-600 text-white p-4">
            <h3 className="text-lg font-semibold">สมาชิกไม่มีนิติบุคคล (ทน)</h3>
            <p className="text-sm opacity-90">สำหรับบุคคลทั่วไปที่ทำงานด้านอุตสาหกรรม</p>
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
              href={`/membership/upgrade?type=tn&name=${encodeURIComponent('สมาชิกไม่มีนิติบุคคล (ทน)')}&fee=6000`}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors block text-center"
            >
              อัพเกรด
            </Link>
          </div>
        </div>
      </div>

      {/* Standard Membership Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* สมาชิกสมทบ */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-amber-600 text-white p-4">
            <h3 className="text-lg font-semibold">สมาชิกสมทบ (ทบ)</h3>
            <p className="text-sm opacity-90">สำหรับบุคคลทั่วไปที่สนใจงานด้านอุตสาหกรรม</p>
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
              href={`/membership/upgrade?type=tb&name=${encodeURIComponent('สมาชิกสมทบ (ทบ)')}&fee=3000`}
              className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors block text-center"
            >
              อัพเกรด
            </Link>
          </div>
        </div>
        
        {/* สมาชิกทั่วไป */}
        <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gray-600 text-white p-4">
            <h3 className="text-lg font-semibold">สมาชิกทั่วไป</h3>
            <p className="text-sm opacity-90">สำหรับผู้ที่สมัครเข้าใช้งานระบบครั้งแรก</p>
          </div>
          <div className="p-4">
            <p className="text-xl font-bold text-black mb-2">ฟรี</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-black">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
                ดูข้อมูลข่าวสารทั่วไป
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
                เข้าร่วมกิจกรรมสาธารณะ
              </li>
            </ul>
            <div className="w-full bg-gray-200 text-gray-700 py-2 rounded text-center font-medium">
              สถานะปัจจุบันของคุณ
            </div>
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
                <th className="py-3 px-4 text-center text-black font-medium border-b">ทั่วไป</th>
                <th className="py-3 px-4 text-center text-amber-600 font-medium border-b">สมทบ</th>
                <th className="py-3 px-4 text-center text-green-600 font-medium border-b">ไม่มีนิติบุคคล</th>
                <th className="py-3 px-4 text-center text-purple-600 font-medium border-b">วิสามัญ</th>
                <th className="py-3 px-4 text-center text-blue-600 font-medium border-b">สามัญ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 border-b text-black">รับข่าวสาร</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
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
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b text-black">เครือข่ายธุรกิจอุตสาหกรรม</td>
                <td className="py-3 px-4 text-center border-b text-black">-</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 border-b text-black">สิทธิเข้าร่วมประชุมใหญ่</td>
                <td className="py-3 px-4 text-center border-b text-black">-</td>
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
                <td className="py-3 px-4 text-center border-b text-black">-</td>
                <td className="py-3 px-4 text-center border-b text-black">✓</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 font-medium text-black">ค่าสมาชิกรายปี</td>
                <td className="py-3 px-4 text-center font-medium text-black">ฟรี</td>
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
            <p className="mt-2 text-black">สมาชิกสามัญต้องเป็นผู้ประกอบการในภาคอุตสาหกรรม สมาชิกวิสามัญต้องเป็นธุรกิจที่เกี่ยวข้องกับอุตสาหกรรม สมาชิกไม่มีนิติบุคคลและสมาชิกสมทบไม่จำเป็นต้องมีธุรกิจเป็นของตนเอง</p>
          </div>
        </div>
      </div>
    </div>
  );
}