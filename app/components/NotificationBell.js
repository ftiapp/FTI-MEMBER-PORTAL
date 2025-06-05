'use client';

import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { handleNotificationClick } from '@/app/dashboard/notifications/utils/notificationHelpers';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // ดึงข้อมูลการแจ้งเตือน
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  // ปิดเมนูเมื่อคลิกนอกพื้นที่
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ดึงข้อมูลการแจ้งเตือนจาก API
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // เพิ่ม credentials: 'include' เพื่อให้ส่ง cookies ไปด้วย
      const response = await fetch(`/api/notifications?userId=${user.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error('Notification response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      console.log('Notifications data:', data); // เพิ่ม log เพื่อดูข้อมูลที่ได้รับ
      setNotifications(data.notifications || []);
      
      // นับจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
      const unread = data.notifications.filter(notification => !notification.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ทำเครื่องหมายว่าอ่านแล้ว
  const markAsRead = async (notificationId) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        credentials: 'include', // เพิ่ม credentials เพื่อให้ส่ง cookies ไปด้วย
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          notificationId
        }),
      });
      
      if (!response.ok) {
        console.error('Mark as read response not OK:', response.status, response.statusText);
        throw new Error('Failed to mark notification as read');
      }
      
      // อัพเดทสถานะการอ่านในข้อมูลท้องถิ่น
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() } 
            : notification
        )
      );
      
      // อัพเดทจำนวนที่ยังไม่ได้อ่าน
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ทำเครื่องหมายว่าอ่านทั้งหมด
  const markAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include', // เพิ่ม credentials เพื่อให้ส่ง cookies ไปด้วย
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });
      
      if (!response.ok) {
        console.error('Mark all as read response not OK:', response.status, response.statusText);
        throw new Error('Failed to mark all notifications as read');
      }
      
      // อัพเดทสถานะการอ่านในข้อมูลท้องถิ่น
      const now = new Date().toISOString();
      setNotifications(prev => 
        prev.map(notification => 
          notification.read_at ? notification : { ...notification, read_at: now }
        )
      );
      
      // รีเซ็ตจำนวนที่ยังไม่ได้อ่านเป็น 0
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // แสดงไอคอนตามประเภทการแจ้งเตือน
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'member_verification':
        return <span className="text-blue-500">✓</span>;
      case 'contact_reply':
        return <span className="text-green-500">✉</span>;
      case 'address_update':
        return <span className="text-purple-500">🏠</span>;
      case 'profile_update':
        return <span className="text-orange-500">👤</span>;
      default:
        return <span className="text-gray-500">•</span>;
    }
  };

  // แปลงเวลาเป็นรูปแบบที่อ่านง่าย
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} วันที่แล้ว`;
    } else if (diffHour > 0) {
      return `${diffHour} ชั่วโมงที่แล้ว`;
    } else if (diffMin > 0) {
      return `${diffMin} นาทีที่แล้ว`;
    } else {
      return 'เมื่อสักครู่';
    }
  };
  
  // จัดรูปแบบข้อความแจ้งเตือนให้แสดงสถานะการอนุมัติ/ปฏิเสธด้วยสีที่แตกต่างกัน
  const formatNotificationMessage = (message) => {
    if (!message) return '';
    
    // ตรวจสอบว่าข้อความมีคำว่า "ได้รับการอนุมัติแล้ว" หรือไม่
    if (message.includes('ได้รับการอนุมัติแล้ว')) {
      const parts = message.split('ได้รับการอนุมัติแล้ว');
      return (
        <>
          {parts[0]}
          <span className="font-bold text-green-600">ได้รับการอนุมัติแล้ว</span>
        </>
      );
    }
    
    // ตรวจสอบว่าข้อความมีคำว่า "ถูกปฏิเสธ" หรือไม่
    if (message.includes('ถูกปฏิเสธ')) {
      // ตัดเอาส่วนที่อยู่ก่อนคำว่า "ถูกปฏิเสธ" และไม่แสดงเหตุผลที่ปฏิเสธ
      const parts = message.split('ถูกปฏิเสธ');
      return (
        <>
          {parts[0]}
          <span className="font-bold text-red-600">ถูกปฏิเสธ</span>
        </>
      );
    }
    
    // สำหรับข้อความอื่นๆ ให้แสดงตามปกติ
    return message;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ไอคอนกระดิ่ง */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        aria-label="การแจ้งเตือน"
      >
        <FaBell className="w-5 h-5" />
        
        {/* แสดงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* เมนูแสดงการแจ้งเตือน */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">การแจ้งเตือน</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="inline-block h-6 w-6 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin mb-2"></div>
                  <p>กำลังโหลด...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  ไม่มีการแจ้งเตือน
                </div>
              ) : (
                <ul>
                  {notifications.slice(0, 5).map(notification => (
                    <li 
                      key={notification.id}
                      className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-blue-50' : ''}`}
                    >
                      <button
                        onClick={() => {
                          // ทำเครื่องหมายว่าอ่านแล้ว
                          markAsRead(notification.id);
                          
                          // ถ้ามีลิงก์ให้นำทางไปยังลิงก์นั้น
                          if (notification.link) {
                            // ใช้ฟังก์ชัน handleNotificationClick เหมือนกับในหน้าการแจ้งเตือนหลัก
                            // เพื่อให้การนำทางทำงานเหมือนกันทั้งสองที่
                            setTimeout(() => {
                              handleNotificationClick(notification);
                            }, 300); // รอเล็กน้อยเพื่อให้การทำเครื่องหมายว่าอ่านแล้วเสร็จก่อน
                          }
                        }}
                        className="w-full p-3 text-left flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read_at ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {formatNotificationMessage(notification.message)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                          {notification.link && (
                            <p className="text-xs text-blue-600 mt-1">
                              คลิกเพื่อดูรายละเอียด
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-2 border-t border-gray-200 text-center">
              <Link 
                href="/dashboard/notifications" 
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setIsOpen(false)}
              >
                ดูการแจ้งเตือนทั้งหมด
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
