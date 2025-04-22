'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaExclamationCircle } from 'react-icons/fa';

export default function UpdateMember() {
  const MAX_REQUESTS_PER_DAY = 3;

  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [requestsToday, setRequestsToday] = useState(0);
  const [limitLoading, setLimitLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
      fetchUpdateStatus();
      fetchProfileUpdateLimit();
    }
  }, [user]);

  const fetchProfileUpdateLimit = async () => {
    setLimitLoading(true);
    try {
      const response = await fetch('/api/user/profile-update-limit');
      if (response.ok) {
        const data = await response.json();
        setRequestsToday(data.count || 0);
      }
    } catch (error) {
      setRequestsToday(0);
    } finally {
      setLimitLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setLoadingError(false);
      const response = await fetch(`/api/user/profile?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          firstName: data.firstname || '',
          lastName: data.lastname || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        setOriginalData({
          firstName: data.firstname || '',
          lastName: data.lastname || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      } else {
        setLoadingError(true);
        toast.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoadingError(true);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/user/profile-update-status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUpdateStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching update status:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Allow only numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('กรุณากรอกชื่อและนามสกุลให้ครบถ้วน');
      return false;
    }

    // Check if any data has changed
    const hasChanges = Object.keys(formData).some(key => formData[key] !== originalData[key]);
    if (!hasChanges) {
      toast.error('ไม่มีข้อมูลที่เปลี่ยนแปลง');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (requestsToday >= MAX_REQUESTS_PER_DAY) {
      toast.error('คุณได้ส่งคำขอครบจำนวนสูงสุดในวันนี้แล้ว กรุณารอวันถัดไป');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: originalData.email,
          phone: originalData.phone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('ส่งคำขอแก้ไขข้อมูลสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ');
        fetchUpdateStatus();
        setRequestsToday(r => r + 1);
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!updateStatus) return null;
    
    // แสดงเฉพาะสถานะ "รอการอนุมัติ" เท่านั้น
    if (updateStatus.status === 'pending') {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                คำขอแก้ไขข้อมูลของคุณกำลังรอการอนุมัติ
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Handle retry when loading failed
  const handleRetry = () => {
    if (user?.id) {
      fetchUserData();
      fetchUpdateStatus();
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="py-16 flex flex-col items-center justify-center text-gray-600">
          <FaSpinner className="animate-spin text-blue-600 mb-3" size={28} />
          <p className="font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }
  
  if (loadingError) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-red-200 rounded-lg">
          <FaExclamationCircle className="text-red-500 mb-3" size={28} />
          <p className="font-medium mb-3">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
       
        
        {getStatusBadge()}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="ชื่อ"
                disabled={updateStatus?.status === 'pending'}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="นามสกุล"
                disabled={updateStatus?.status === 'pending'}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-900"
                placeholder="อีเมล"
                disabled={true}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-900"
                placeholder="เบอร์โทรศัพท์"
                disabled={true}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || updateStatus?.status === 'pending'}
            >
              {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอแก้ไขข้อมูล'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Add global animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        button:active {
          transform: translateY(1px);
        }
      `}</style>
    </div>
  );
}