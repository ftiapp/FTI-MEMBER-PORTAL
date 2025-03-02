'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('อัพเดตสมาชิก');
  const [membershipType, setMembershipType] = useState('ทั่วไป'); // Default membership type

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      name: 'อัพเดตสมาชิก',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'จัดการเอกสาร',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'อัพเกรดสมาชิก',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      name: 'ยืนยันสมาชิกเดิม',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'ชำระค่าบริการ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      name: 'กิจกรรมล่าสุด',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'ข้อมูลสมาชิก',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'ติดต่อเรา',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'อัพเดตสมาชิก':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">อัพเดตข้อมูลสมาชิก</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="Pairoj"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="Chuanchanachai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="c.pairoj.n@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="0830755301"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      case 'จัดการเอกสาร':
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
      case 'อัพเกรดสมาชิก':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">อัพเกรดสมาชิก</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">สถานะสมาชิกปัจจุบัน: <span className="text-blue-700">ประเภท{membershipType}</span></p>
                  <p className="text-sm text-gray-600">เลือกประเภทสมาชิกที่ต้องการอัพเกรด เพื่อรับสิทธิประโยชน์เพิ่มเติม</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* สมาชิกสามัญ */}
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-blue-600 text-white p-4">
                  <h3 className="text-lg font-semibold">สมาชิกสามัญ (สส)</h3>
                  <p className="text-sm opacity-90">สำหรับผู้ประกอบการภาคอุตสาหกรรม</p>
                </div>
                <div className="p-4">
                  <p className="text-xl font-bold text-gray-800 mb-2">12,000 บาท/ปี</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      สิทธิในการเข้าร่วมประชุมใหญ่
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      สิทธิในการออกเสียงเลือกตั้ง
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
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
                  <p className="text-xl font-bold text-gray-800 mb-2">8,000 บาท/ปี</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      สิทธิในการเข้าร่วมประชุมใหญ่
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      รับข้อมูลข่าวสารจากสภาอุตสาหกรรม
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
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
                  <p className="text-xl font-bold text-gray-800 mb-2">6,000 บาท/ปี</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      เข้าร่วมกิจกรรมของสภาอุตสาหกรรม
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      รับข้อมูลข่าวสารจากสภาอุตสาหกรรม
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* สมาชิกสมทบ */}
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-amber-600 text-white p-4">
                  <h3 className="text-lg font-semibold">สมาชิกสมทบ (ทบ)</h3>
                  <p className="text-sm opacity-90">สำหรับบุคคลทั่วไปที่สนใจงานด้านอุตสาหกรรม</p>
                </div>
                <div className="p-4">
                  <p className="text-xl font-bold text-gray-800 mb-2">3,000 บาท/ปี</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      เข้าร่วมกิจกรรมของสภาอุตสาหกรรม
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      รับข้อมูลข่าวสารจากสภาอุตสาหกรรม
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
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
                  <p className="text-xl font-bold text-gray-800 mb-2">ฟรี</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      ดูข้อมูลข่าวสารทั่วไป
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      รับข้อมูลข่าวสารจากสภาอุตสาหกรรม
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      เข้าร่วมกิจกรรมสาธารณะ
                    </li>
                  </ul>
                  <div className="w-full bg-gray-200 text-gray-500 py-2 rounded text-center font-medium">
                    สถานะปัจจุบันของคุณ
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ยืนยันสมาชิกเดิม':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">ยืนยันตัวตนสมาชิกเดิม</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">หากคุณเป็นสมาชิกเดิมของสภาอุตสาหกรรมแห่งประเทศไทย</p>
                  <p className="text-sm text-gray-600">กรุณากรอกข้อมูลเพื่อยืนยันตัวตนและเชื่อมโยงบัญชีของคุณ</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลขที่สมาชิก
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="เช่น M12345"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ประเภทสมาชิก
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">-- เลือกประเภทสมาชิก --</option>
                      <option value="สส">สมาชิกสามัญ (สส)</option>
                      <option value="สน">สมาชิกวิสามัญ (สน)</option>
                      <option value="ทน">สมาชิกไม่มีนิติบุคคล (ทน)</option>
                      <option value="ทบ">สมาชิกสมทบ (ทบ)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อบริษัท/องค์กร
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ชื่อบริษัทหรือองค์กรที่ลงทะเบียนไว้"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลขประจำตัวผู้เสียภาษี
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="เลข 13 หลัก"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ที่ลงทะเบียนไว้
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="เบอร์โทรศัพท์ที่ใช้ลงทะเบียนไว้กับสภาอุตสาหกรรม"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อัพโหลดเอกสารยืนยันตัวตน
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>อัพโหลดไฟล์</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">หรือลากไฟล์มาวางที่นี่</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        รองรับไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 10MB
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    ส่งข้อมูลเพื่อยืนยันตัวตน
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="flex items-start">
                <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  หลังจากส่งข้อมูลแล้ว เจ้าหน้าที่จะตรวจสอบและยืนยันตัวตนของคุณภายใน 1-2 วันทำการ
                  คุณจะได้รับการแจ้งเตือนผ่านอีเมลเมื่อการยืนยันตัวตนเสร็จสมบูรณ์
                </span>
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{activeTab}</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p>เนื้อหาสำหรับ {activeTab} จะแสดงที่นี่</p>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Include Navbar */}
      <Navbar />
      
      <div className="container-custom py-8">
        {/* Dashboard Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">ยินดีต้อนรับ, {user.name || 'สมาชิก'}</h1>
              <div className="flex items-center mt-2">
                <span className="text-gray-600">สถานะสมาชิก:</span>
                <span className="ml-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                  ประเภท{membershipType}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <button
                onClick={logout}
                className="flex items-center text-red-600 hover:text-red-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v6" />
                </svg>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-blue-700 p-6 text-white">
                <h2 className="text-xl font-bold">ยินดีต้อนรับ, Pairoj</h2>
                <p className="text-blue-100 mt-1">จัดการข้อมูลสมาชิกและบริการต่างๆ</p>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => setActiveTab(item.name)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === item.name
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={activeTab === item.name ? 'text-blue-700' : 'text-gray-500'}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
