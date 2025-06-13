'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

/**
 * Admin Activities Page
 * 
 * This component provides functionality for viewing all admin activities including:
 * - Admin login/logout events
 * - Member approval/rejection actions
 * - Address update approval/rejection actions
 * - Admin user management actions
 * 
 * Only accessible to admin users with level 5 (SuperAdmin) permissions.
 */

export default function ActivitiesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Fetch activities when component mounts or filter/page changes
  useEffect(() => {
    fetchActivities();
  }, [filter, page]);

  /**
   * Fetches the list of admin activities from the API
   * Handles authentication, loading states, and error handling
   */
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      let url = `/api/admin/activities?page=${page}&filter=${filter}`;
      
      if (dateRange.start) {
        url += `&start=${dateRange.start}`;
      }
      
      if (dateRange.end) {
        url += `&end=${dateRange.end}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('กรุณาเข้าสู่ระบบ');
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data);
        setTotalPages(result.totalPages || 1);
      } else {
        toast.error(result.message || 'ไม่สามารถดึงข้อมูลได้');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles filter change
   * @param {Event} e - The select change event
   */
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  /**
   * Handles date range change
   * @param {Event} e - The input change event
   */
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Applies the date filter
   */
  const applyDateFilter = () => {
    setPage(1); // Reset to first page when applying new date filter
    fetchActivities();
  };

  /**
   * Clears the date filter
   */
  const clearDateFilter = () => {
    setDateRange({
      start: '',
      end: ''
    });
    setPage(1);
    // The fetchActivities will be triggered by the useEffect when dateRange changes
  };

  /**
   * Renders the activity type badge with appropriate color
   * @param {string} type - The activity type
   * @returns {JSX.Element} - The rendered badge
   */
  const renderActivityTypeBadge = (type) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    
    switch (type) {
      case 'login':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'logout':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'create':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'update':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'delete':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'approve':
        bgColor = 'bg-emerald-100';
        textColor = 'text-emerald-800';
        break;
      case 'reject':
        bgColor = 'bg-rose-100';
        textColor = 'text-rose-800';
        break;
    }
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {type}
      </span>
    );
  };

  /**
   * Formats the activity details for display
   * @param {Object} activity - The activity object
   * @returns {string} - Formatted activity details
   */
  const formatActivityDetails = (activity) => {
    try {
      if (typeof activity.details === 'string') {
        // Try to parse if it's a JSON string
        try {
          const details = JSON.parse(activity.details);
          return Object.entries(details)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        } catch {
          // If not valid JSON, return as is
          return activity.details;
        }
      } else if (typeof activity.details === 'object') {
        return Object.entries(activity.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }
      return 'ไม่มีรายละเอียด';
    } catch (error) {
      console.error('Error formatting activity details:', error);
      return 'ไม่สามารถแสดงรายละเอียดได้';
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">กิจกรรมของแอดมิน</h2>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Filter by activity type */}
            <div className="w-full md:w-auto">
              <select
                value={filter}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">ทั้งหมด</option>
                <option value="login">เข้าสู่ระบบ</option>
                <option value="logout">ออกจากระบบ</option>
                <option value="create">สร้าง</option>
                <option value="update">แก้ไข</option>
                <option value="delete">ลบ</option>
                <option value="approve">อนุมัติ</option>
                <option value="reject">ปฏิเสธ</option>
              </select>
            </div>
            
            {/* Date range filter */}
            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <span className="self-center">ถึง</span>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                onClick={applyDateFilter}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                กรอง
              </button>
              <button
                onClick={clearDateFilter}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                ล้าง
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            ไม่พบข้อมูลกิจกรรม
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่และเวลา
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ผู้ดูแลระบบ
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภทกิจกรรม
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รายละเอียด
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(activity.timestamp).toLocaleString('th-TH')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.admin_username}</div>
                        <div className="text-xs text-gray-500">ระดับ {activity.admin_level}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderActivityTypeBadge(activity.action_type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-md break-words">
                          {formatActivityDetails(activity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{activity.ip_address}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    แสดง <span className="font-medium">{activities.length}</span> รายการ จากทั้งหมด{' '}
                    <span className="font-medium">{totalPages * activities.length}</span> รายการ
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                        page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                        page === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
