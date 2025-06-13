'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import AdminLayout from '../../../admin/components/AdminLayout';
import toast from 'react-hot-toast';

export default function RecentActivities() {
  const router = useRouter();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState(null);
  
  // ตรวจสอบสิทธิ์ Super Admin (admin_level 5)
  useEffect(() => {
    async function checkAdminLevel() {
      try {
        const res = await fetch('/api/admin/check-session', { cache: 'no-store', next: { revalidate: 0 } });
        const data = await res.json();
        
        if (data.success && data.admin) {
          setAdmin(data.admin);
          
          // ถ้าไม่ใช่ Super Admin (admin_level 5) ให้ redirect กลับไปหน้า dashboard
          if (data.admin.admin_level < 5) {
            toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะ Super Admin เท่านั้น');
            router.push('/admin/dashboard');
          }
        } else {
          // ถ้าไม่มีข้อมูล admin ให้ redirect ไปหน้า login
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error checking admin level:', error);
        toast.error('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
        router.push('/admin/dashboard');
      }
    }
    
    checkAdminLevel();
  }, [router]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5 // แสดง 5 รายการต่อหน้า
  });
  
  // Animation variants for smoother transitions
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // Transition settings
  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };

  // Fetch activities from the API
  const fetchActivities = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/recent-activities?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.activities);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch activities');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchActivities(pagination.currentPage, pagination.limit);
  }, [user, router]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActivities(newPage, pagination.limit);
    }
  };

  // Format date to Thai locale
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy HH:mm:ss', { locale: th });
    } catch (e) {
      return dateString;
    }
  };

  // Get action type badge color
  const getActionBadgeColor = (actionType) => {
    switch (actionType) {
      case 'approve_member':
      case 'approve_profile_update':
        return 'bg-green-100 text-green-800';
      case 'reject_member':
      case 'reject_profile_update':
        return 'bg-red-100 text-red-800';
      case 'contact_message_response':
        return 'bg-blue-100 text-blue-800';
      case 'update_admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    
    // Create array of page numbers to show
    let pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first and last page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, maxPagesToShow - 1);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - maxPagesToShow + 2);
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Add last page if not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
        <div className="text-sm text-gray-700">
          แสดง <span className="font-medium">{activities.length}</span> รายการ
          จากทั้งหมด <span className="font-medium">{pagination.totalItems}</span> รายการ
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            ก่อนหน้า
          </button>
          
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-1 rounded-md ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'bg-white text-gray-700 cursor-default'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            ถัดไป
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <motion.div 
        className="space-y-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            กิจกรรมล่าสุด
          </motion.h1>
          <motion.button
            onClick={() => fetchActivities(pagination.currentPage, pagination.limit)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            รีเฟรช
          </motion.button>
        </div>
        
        {loading && activities.length === 0 ? (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-red-50 p-4 rounded-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activities.length === 0 ? (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            ไม่พบข้อมูลกิจกรรมล่าสุด
          </motion.div>
        ) : (
          <motion.div
            className="bg-white shadow overflow-hidden sm:rounded-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ul className="divide-y divide-gray-200">
              {activities.map((activity, index) => (
                <motion.li 
                  key={activity.id} 
                  className="px-6 py-4 transition duration-150 ease-in-out hover:bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ backgroundColor: "#f9fafb", x: 3 }}
                >
                  <div className="flex items-center justify-between sm:flex-row flex-col sm:items-center items-start">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {activity.adminName ? activity.adminName.charAt(0).toUpperCase() : 'A'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.adminName || 'ผู้ดูแลระบบ'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="sm:ml-0 ml-14 mt-2 sm:mt-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(activity.actionType)}`}>
                        {activity.actionType}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 ml-14">
                    <p className="text-sm text-gray-700">
                      {activity.readableAction}
                    </p>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(activity.details).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {renderPagination()}
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  );
}
