'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import ActionCounts from '../components/ActionCounts';
import Alluser from '../components/Alluser';
import Analytics from '../components/Analytics';
import ChangePersonal from '../components/ChangePersonal';
import ContactMessageStats from '../components/ContactMessageStats';
import GuestContactMessageStats from '../components/GuestContactMessageStats';
import Link from 'next/link';

/**
 * Admin Dashboard Component
 * 
 * This component serves as the main entry point for the admin dashboard.
 * It displays a summary of important information and quick access to key functions.
 */

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    pendingUpdates: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    recentActivities: []
  });
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user statistics
        const userStatsRes = await fetch('/api/admin/UserCountStat');
        const userStatsData = await userStatsRes.json();
        
        // Fetch pending updates count
        const updateRes = await fetch('/api/admin/search-members?status=pending');
        const updateData = await updateRes.json();
        
        // Fetch admin info
        const adminRes = await fetch('/api/admin/check-session', { cache: 'no-store', next: { revalidate: 0 } });
        const adminData = await adminRes.json();
        
        if (adminData.success && adminData.admin) {
          setAdminInfo(adminData.admin);
        }
        
        setStats({
          pendingUpdates: updateData.success ? updateData.data.length : 0,
          totalUsers: userStatsData.success ? userStatsData.counts.total : 0,
          activeUsers: userStatsData.success ? userStatsData.counts.active : 0,
          pendingUsers: userStatsData.success ? userStatsData.counts.pending : 0,
          recentActivities: []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ยินดีต้อนรับ, {adminInfo?.name || adminInfo?.username || 'ผู้ดูแลระบบ'}</h1>
            <p className="text-gray-600">สรุปภาพรวมระบบ FTI-Portal Management</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/admin/dashboard/verify?status=0" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-600">จำนวนผู้ใช้งานทั้งหมด</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/dashboard/update" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-600">รอการอนุมัติแก้ไข</p>
                  <p className="text-3xl font-bold text-green-600">{stats.pendingUpdates}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/members" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-600">ผู้ใช้งานที่ยืนยันแล้ว</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.activeUsers}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Action Counts */}
          <ActionCounts title="สถิติการดำเนินการในระบบ" />
          
          {/* User Statistics */}
          <div id="user-stats" className="relative mb-12">
            <Alluser 
              title="สถิติผู้ใช้งานระบบ" 
            />
          </div>
          
          {/* Stats Group */}
          <div className="mb-16">
            <h2 className="text-xl font-bold text-gray-800 mb-8">สถิติการดำเนินการและการอนุมัติ</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {/* Member Verification Stats */}
              <div id="member-stats" className="bg-white rounded-lg shadow-md p-1">
                <Analytics 
                  title="ยืนยันตัวสมาชิกเดิม - บริษัท" 
                  endpoint="/api/admin/member-verification-stats" 
                />
              </div>
              
              {/* Profile Update Stats */}
              <div id="personal-update-stats" className="bg-white rounded-lg shadow-md p-1">
                <ChangePersonal 
                  title="แจ้งเปลี่ยนข้อมูลส่วนตัว" 
                  endpoint="/api/admin/profile_update_stat" 
                />
              </div>
              
              {/* Contact Message Stats */}
              <div className="bg-white rounded-lg shadow-md p-1">
                <ContactMessageStats title="สถิติข้อความติดต่อ (สมาชิก)" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-1">
                <GuestContactMessageStats title="สถิติข้อความติดต่อ (บุคคลทั่วไป)" />
              </div>
            </div>
          </div>
          
          {/* System Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลระบบ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">ข้อมูลผู้ดูแลระบบ</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2"><span className="font-medium">ชื่อผู้ใช้:</span> {adminInfo?.username || '-'}</p>
                  <p className="mb-2"><span className="font-medium">ชื่อ:</span> {adminInfo?.name || '-'}</p>
                  <p className="mb-2"><span className="font-medium">ระดับสิทธิ์:</span> {adminInfo?.adminLevel === 5 ? 'ผู้ดูแลระบบสูงสุด' : 'ผู้ดูแลระบบ'}</p>
                  <p><span className="font-medium">สิทธิ์การใช้งาน:</span> {adminInfo?.canCreate ? 'สร้าง/แก้ไข' : 'อ่านอย่างเดียว'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">สถานะระบบ</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2"><span className="font-medium">สถานะ:</span> <span className="text-green-600 font-medium">ออนไลน์</span></p>
                  <p className="mb-2"><span className="font-medium">เวอร์ชัน:</span> 1.0.0</p>
                  <p className="mb-2"><span className="font-medium">อัพเดตล่าสุด:</span> {new Date().toLocaleDateString('th-TH')}</p>
                  <p><span className="font-medium">สถานะฐานข้อมูล:</span> <span className="text-green-600 font-medium">เชื่อมต่อแล้ว</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}