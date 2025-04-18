'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { FaEnvelope, FaIdCard, FaFileAlt, FaUserEdit, FaChevronLeft, FaChevronRight, FaUserCog } from 'react-icons/fa';

export default function RecentActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user?.id) {
      fetchUserActivities(user.id);
    }
  }, [user]);

  const fetchUserActivities = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/activities?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      } else {
        console.error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'contact_message':
        return <FaEnvelope className="text-blue-500" />;
      case 'member_verification':
        return <FaIdCard className="text-green-500" />;
      case 'document_upload':
        return <FaFileAlt className="text-yellow-500" />;
      case 'profile_update':
        return <FaUserEdit className="text-purple-500" />;
      case 'profile_update_request':
        return <FaUserCog className="text-indigo-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getActivityStatus = (activity) => {
    if (activity.type === 'contact') {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          activity.status === 'unread' ? 'bg-yellow-100 text-yellow-800' :
          activity.status === 'read' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {activity.status === 'unread' ? 'ยังไม่อ่าน' :
           activity.status === 'read' ? 'อ่านแล้ว' : 'ตอบกลับแล้ว'}
        </span>
      );
    } else if (activity.type === 'member') {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          !activity.Admin_Submit ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {!activity.Admin_Submit ? 'รอการตรวจสอบ' : 'ตรวจสอบแล้ว'}
        </span>
      );
    } else if (activity.type === 'profile') {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          activity.status === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {activity.status === 'pending' ? 'รอการอนุมัติ' :
           activity.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'd MMM yyyy, HH:mm', { locale: th });
  };

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  
  // คำนวณรายการที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activities.slice(indexOfFirstItem, indexOfLastItem);

  // ฟังก์ชันเปลี่ยนหน้า
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="pb-4 border-b">
          <h3 className="text-lg font-medium">กิจกรรมของคุณ</h3>
        </div>
        
        {loading ? (
          <div className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-gray-500">ยังไม่มีกิจกรรมล่าสุด</div>
        ) : (
          <div className="space-y-4">
            {currentItems.map((activity, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3 text-center min-w-[60px]">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">
                        {activity.type === 'contact' ? activity.subject : 
                         activity.type === 'member' ? `${activity.company_name} (${activity.MEMBER_CODE})` : 
                         activity.type === 'profile' ? 'คำขอแก้ไขข้อมูลส่วนตัว' :
                         activity.details}
                      </h4>
                      {getActivityStatus(activity)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.type === 'contact' ? 
                        `ข้อความ: ${activity.message.substring(0, 100)}${activity.message.length > 100 ? '...' : ''}` : 
                       activity.type === 'member' ? 
                        `ประเภทบริษัท: ${activity.company_type}` : 
                       activity.type === 'profile' ? 
                        `${activity.status === 'rejected' ? `เหตุผลที่ปฏิเสธ: ${activity.reject_reason || 'ไม่ระบุเหตุผล'}` : 'คำขอแก้ไขข้อมูลชื่อ นามสกุล อีเมล และเบอร์โทรศัพท์'}` :
                        activity.details}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      {formatDate(activity.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                >
                  <FaChevronLeft size={14} />
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(totalPages).keys()].map(number => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`w-8 h-8 rounded ${currentPage === number + 1 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {number + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
