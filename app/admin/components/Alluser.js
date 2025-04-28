'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Alluser Component
 * 
 * This component displays user statistics and a table of all users
 * with their login information.
 */
export default function Alluser({ title = "สถิติผู้ใช้งานระบบ" }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    statusCounts: {
      active: 0,
      inactive: 0,
      pending: 0
    },
    roleCounts: {
      admin: 0,
      member: 0
    },
    loginStats: {
      totalLogins: 0,
      avgLogins: 0,
      neverLoggedIn: 0,
      mostActiveUsers: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/AlluserSTAT');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.message || 'ไม่สามารถโหลดข้อมูลได้');
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        console.error('Error fetching user stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">ผู้ใช้งานทั้งหมด</p>
          <p className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">จำนวนการเข้าสู่ระบบทั้งหมด</p>
          <p className="text-2xl font-bold mt-1">{stats.loginStats.totalLogins.toLocaleString()}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">เฉลี่ยเข้าสู่ระบบต่อผู้ใช้</p>
          <p className="text-2xl font-bold mt-1">{stats.loginStats.avgLogins.toFixed(1)}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">ไม่เคยเข้าสู่ระบบ</p>
          <p className="text-2xl font-bold mt-1">{stats.loginStats.neverLoggedIn.toLocaleString()}</p>
        </div>
      </div>
      
      {/* User Status and Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">สถานะผู้ใช้งาน</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">ใช้งานอยู่</span>
              <span className="font-semibold text-blue-600">{stats.statusCounts.active.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(stats.statusCounts.active / stats.totalUsers) * 100}%` }}></div>
            </div>
            
            <div className="flex justify-between items-center mt-4 mb-2">
              <span className="text-gray-600">ไม่ได้ใช้งาน</span>
              <span className="font-semibold text-yellow-600">{stats.statusCounts.inactive.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${(stats.statusCounts.inactive / stats.totalUsers) * 100}%` }}></div>
            </div>
            
            <div className="flex justify-between items-center mt-4 mb-2">
              <span className="text-gray-600">รอการยืนยัน</span>
              <span className="font-semibold text-red-600">{stats.statusCounts.pending.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(stats.statusCounts.pending / stats.totalUsers) * 100}%` }}></div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">บทบาทผู้ใช้งาน</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">ผู้ดูแลระบบ</span>
              <span className="font-semibold text-purple-600">{stats.roleCounts.admin.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(stats.roleCounts.admin / stats.totalUsers) * 100}%` }}></div>
            </div>
            
            <div className="flex justify-between items-center mt-4 mb-2">
              <span className="text-gray-600">สมาชิก</span>
              <span className="font-semibold text-green-600">{stats.roleCounts.member.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(stats.roleCounts.member / stats.totalUsers) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Most Active Users Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">ผู้ใช้งานที่เข้าสู่ระบบบ่อยที่สุด</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนเข้าสู่ระบบ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.loginStats.mostActiveUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.login_count.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/admin/members/view/${user.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      ดูข้อมูล
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* View All Users Link */}
      <div className="flex justify-end">
        <Link href="/admin/members" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          ดูข้อมูลผู้ใช้งานทั้งหมด
        </Link>
      </div>
    </div>
  );
}