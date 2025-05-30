'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaBell, FaCheck, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/notifications?userId=${user.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('ไม่สามารถโหลดการแจ้งเตือนได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Pagination calculations
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  // Reset to first page when notifications change
  useEffect(() => {
    setCurrentPage(1);
  }, [notifications.length]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of notifications list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markAsRead = async (notificationId) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          notificationId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      const now = new Date().toISOString();
      setNotifications(prev => 
        prev.map(notification => 
          notification.read_at ? notification : { ...notification, read_at: now }
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format date to Thai format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format notification message to highlight approval/rejection status
  const formatNotificationMessage = (message) => {
    if (!message) return '';
    
    // Check if message contains approval keywords
    if (message.includes('ได้รับการอนุมัติแล้ว')) {
      return (
        <span>
          {message.split('ได้รับการอนุมัติแล้ว')[0]}
          <span className="font-bold text-green-600">ได้รับการอนุมัติแล้ว</span>
        </span>
      );
    }
    
    // Check if message contains rejection keywords
    if (message.includes('ถูกปฏิเสธ')) {
      // ตัดเอาส่วนที่อยู่ก่อนคำว่า "ถูกปฏิเสธ" และไม่แสดงเหตุผลที่ปฏิเสธ
      const parts = message.split('ถูกปฏิเสธ');
      return (
        <span>
          {parts[0]}
          <span className="font-bold text-red-600">ถูกปฏิเสธ</span>
        </span>
      );
    }
    
    // For other messages, return as is
    return message;
  };
  
  // ตรวจสอบสถานะของการแจ้งเตือน (อนุมัติ/ปฏิเสธ)
  const getNotificationStatus = (message) => {
    if (!message) return null;
    
    // ตรวจสอบว่าเป็นการอนุมัติหรือไม่
    if (message.includes('ได้รับการอนุมัติแล้ว')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          อนุมัติ
        </span>
      );
    }
    
    // ตรวจสอบว่าเป็นการปฏิเสธหรือไม่
    if (message.includes('ถูกปฏิเสธ')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ปฏิเสธ
        </span>
      );
    }
    
    // สำหรับข้อความอื่นๆ ไม่ต้องแสดงสถานะ
    return null;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'member_verification':
        return <FaCheckCircle className="text-green-500" />;
      case 'contact_reply':
        return <FaBell className="text-blue-500" />;
      case 'address_update':
        return <FaBell className="text-orange-500" />;
      case 'profile_update':
        return <FaBell className="text-purple-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  // Get notification type text in Thai
  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'member_verification':
        return 'การยืนยันสมาชิก';
      case 'contact_reply':
        return 'การตอบกลับข้อความ';
      case 'address_update':
        return 'การอัปเดตที่อยู่';
      case 'profile_update':
        return 'การอัปเดตโปรไฟล์';
      default:
        return 'การแจ้งเตือน';
    }
  };

  // Pagination Component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <motion.div 
        className="flex justify-center items-center mt-8 gap-2"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
          }`}
        >
          <FaChevronLeft className="text-xs" />
          <span className="hidden sm:inline">ก่อนหน้า</span>
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {getPageNumbers().map((pageNumber, index) => (
            <div key={index}>
              {pageNumber === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {pageNumber}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
          }`}
        >
          <span className="hidden sm:inline">ถัดไป</span>
          <FaChevronRight className="text-xs" />
        </button>
      </motion.div>
    );
  };

  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="bg-gray-50 min-h-screen flex-grow">
        {/* Hero Section - ใช้แบบเดียวกับหน้าอื่น */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24 z-[50]">
          {/* ลด decorative elements ในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          {/* Notification icon - ซ่อนในมือถือ */}
          {!isMobile && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              การแจ้งเตือนทั้งหมด
            </h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto text-blue-100">
              ดูและจัดการการแจ้งเตือนทั้งหมดของคุณในระบบ FTI Portal
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          {/* Dashboard Header */}
          <motion.div 
            className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 relative z-[100]"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-between items-center gap-4 mb-4">
              <div className="flex items-center">
                <Link href="/dashboard" className="mr-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors">
                  <FaArrowLeft className="text-xl" />
                  <span className="hidden sm:inline">กลับไปแดชบอร์ด</span>
                </Link>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                  การแจ้งเตือนทั้งหมด
                </h2>
              </div>
              {notifications.length > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                >
                  <FaCheck className="text-xs" /> 
                  <span className="hidden sm:inline">อ่านทั้งหมดแล้ว</span>
                  <span className="sm:hidden">อ่านแล้ว</span>
                </button>
              )}
            </div>

            {/* Pagination Info */}
            {notifications.length > 0 && (
              <div className="text-sm text-gray-600">
                แสดงผล {startIndex + 1}-{Math.min(endIndex, notifications.length)} จาก {notifications.length} รายการ
              </div>
            )}
          </motion.div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            ) : notifications.length === 0 ? (
              <motion.div 
                className="bg-white shadow-md rounded-lg p-8 text-center"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <div className="flex justify-center mb-4">
                  <FaBell className="text-gray-400 text-5xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่มีการแจ้งเตือน</h2>
                <p className="text-gray-500">คุณไม่มีการแจ้งเตือนในขณะนี้</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {currentNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      variants={fadeInUp}
                      className={`bg-white shadow-sm rounded-lg p-4 border-l-4 ${
                        notification.read_at 
                          ? 'border-gray-300' 
                          : 'border-blue-500'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-500">
                                  {getNotificationTypeText(notification.type)}
                                </span>
                                {getNotificationStatus(notification.message)}
                              </div>
                              <h3 className="font-medium text-gray-900">
                                {formatNotificationMessage(notification.message)}
                              </h3>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                          
                          {notification.link && (
                            <div className="mt-2">
                              <button 
                                onClick={() => {
                                  // ตรวจสอบว่าเป็นการแจ้งเตือนที่มีสถานะปฏิเสธหรือไม่
                                  let targetLink = notification.link;
                                  if (notification.message.includes('ถูกปฏิเสธ')) {
                                    // ถ้าเป็นการแจ้งเตือนที่มีสถานะปฏิเสธ ให้ไปที่ /dashboard?tab=status
                                    targetLink = '/dashboard?tab=status';
                                  }
                                  
                                  console.log('Navigating to:', targetLink);
                                  // ใช้ window.location.href แทน router.push เพื่อให้แน่ใจว่ามีการโหลดหน้าใหม่ทั้งหมด
                                  window.location.href = targetLink;
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                ดูรายละเอียด
                              </button>
                            </div>
                          )}
                          
                          {!notification.read_at && (
                            <div className="mt-2 text-right">
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                ทำเครื่องหมายว่าอ่านแล้ว
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                <PaginationControls />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationsPage;