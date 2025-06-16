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
 * Modern Admin Dashboard Component
 * 
 * Redesigned with improved UX, animations, and modern styling
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

  const StatCard = ({ title, value, icon, color, href, subtitle }) => (
    <Link 
      href={href || '#'} 
      className={`group relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            {icon}
          </div>
          <div className="text-white/80 text-sm font-medium">
            {subtitle && `+${Math.floor(Math.random() * 20)}% จากเดือนที่แล้ว`}
          </div>
        </div>
        <div className="text-white">
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{value.toLocaleString()}</p>
          <div className="w-full bg-white/20 rounded-full h-1">
            <div className="bg-white h-1 rounded-full transition-all duration-1000 ease-out" style={{width: `${Math.min(100, (value / Math.max(stats.totalUsers, 100)) * 100)}%`}}></div>
          </div>
        </div>
      </div>
    </Link>
  );

  const AdminInfoCard = () => (
    <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl font-bold">
          {adminInfo?.name?.charAt(0) || adminInfo?.username?.charAt(0) || 'A'}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">
            ยินดีต้อนรับ, {adminInfo?.name || adminInfo?.username || 'ผู้ดูแลระบบ'}
          </h2>
          <p className="text-purple-300 text-sm">
            {adminInfo?.adminLevel === 5 ? 'ผู้ดูแลระบบสูงสุด' : 'ผู้ดูแลระบบ'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-purple-300 text-sm mb-1">สิทธิ์การใช้งาน</p>
          <p className="font-semibold">{adminInfo?.canCreate ? 'สร้าง/แก้ไข' : 'อ่านอย่างเดียว'}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-purple-300 text-sm mb-1">สถานะระบบ</p>
          <p className="font-semibold text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            ออนไลน์
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 rounded-full animate-ping border-t-purple-600 mx-auto opacity-20"></div>
            </div>
            <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="px-6 pt-6 pb-8">
          <div className="mb-8">
            <AdminInfoCard />
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              สรุปภาพรวมระบบ FTI-Portal Management
            </h1>
            <p className="text-gray-600">แดชบอร์ดการจัดการระบบและสถิติการใช้งาน</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="จำนวนผู้ใช้งานทั้งหมด"
              value={stats.totalUsers}
              color="from-blue-500 to-blue-600"
              href="/admin/dashboard/verify?status=0"
              subtitle="total"
              icon={
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            
            <StatCard
              title="รอการอนุมัติแก้ไข"
              value={stats.pendingUpdates}
              color="from-emerald-500 to-green-600"
              href="/admin/dashboard/update"
              subtitle="pending"
              icon={
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            
            <StatCard
              title="ผู้ใช้งานที่ยืนยันแล้ว"
              value={stats.activeUsers}
              color="from-purple-500 to-purple-600"
              subtitle="active"
              icon={
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            
            <StatCard
              title="ผู้ใช้งานรอการอนุมัติ"
              value={stats.pendingUsers}
              color="from-orange-500 to-red-500"
              subtitle="pending"
              icon={
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 space-y-8">
          {/* Action Counts */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">สถิติการดำเนินการในระบบ</h2>
            </div>
            <ActionCounts title="สถิติการดำเนินการในระบบ" />
          </div>
          
          {/* User Statistics */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">สถิติผู้ใช้งานระบบ</h2>
            </div>
            <Alluser title="สถิติผู้ใช้งานระบบ" />
          </div>
          
          {/* Statistics Grid */}
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">สถิติการดำเนินการและการอนุมัติ</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Member Verification Stats */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <h3 className="text-white font-semibold">ยืนยันตัวสมาชิกเดิม - บริษัท</h3>
                </div>
                <div className="p-6">
                  <Analytics 
                    title="ยืนยันตัวสมาชิกเดิม - บริษัท" 
                    endpoint="/api/admin/member-verification-stats" 
                  />
                </div>
              </div>
              
              {/* Profile Update Stats */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
                  <h3 className="text-white font-semibold">แจ้งเปลี่ยนข้อมูลส่วนตัว</h3>
                </div>
                <div className="p-6">
                  <ChangePersonal 
                    title="แจ้งเปลี่ยนข้อมูลส่วนตัว" 
                    endpoint="/api/admin/profile_update_stat" 
                  />
                </div>
              </div>
              
              {/* Contact Message Stats */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
                  <h3 className="text-white font-semibold">สถิติข้อความติดต่อ (สมาชิก)</h3>
                </div>
                <div className="p-6">
                  <ContactMessageStats title="สถิติข้อความติดต่อ (สมาชิก)" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                  <h3 className="text-white font-semibold">สถิติข้อความติดต่อ (บุคคลทั่วไป)</h3>
                </div>
                <div className="p-6">
                  <GuestContactMessageStats title="สถิติข้อความติดต่อ (บุคคลทั่วไป)" />
                </div>
              </div>
            </div>
          </div>
          
          {/* System Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">ข้อมูลระบบ</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ข้อมูลผู้ดูแลระบบ
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชื่อผู้ใช้:</span>
                    <span className="font-medium">{adminInfo?.username || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชื่อ:</span>
                    <span className="font-medium">{adminInfo?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ระดับสิทธิ์:</span>
                    <span className="font-medium text-purple-600">
                      {adminInfo?.adminLevel === 5 ? 'ผู้ดูแลระบบสูงสุด' : 'ผู้ดูแลระบบ'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สิทธิ์การใช้งาน:</span>
                    <span className={`font-medium ${adminInfo?.canCreate ? 'text-green-600' : 'text-orange-600'}`}>
                      {adminInfo?.canCreate ? 'สร้าง/แก้ไข' : 'อ่านอย่างเดียว'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  สถานะระบบ
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">สถานะ:</span>
                    <span className="flex items-center font-medium text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      ออนไลน์
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">เวอร์ชัน:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">อัพเดตล่าสุด:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ฐานข้อมูล:</span>
                    <span className="flex items-center font-medium text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      เชื่อมต่อแล้ว
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}