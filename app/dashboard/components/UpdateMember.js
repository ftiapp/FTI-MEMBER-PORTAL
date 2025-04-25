'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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

  // ตรวจสอบเฉพาะชื่อ-นามสกุล และต้องมีการเปลี่ยนแปลงชื่อ-นามสกุลเท่านั้น
  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('กรุณากรอกชื่อ - นามสกุล ที่ท่านต้องการแก้ไข');
      return false;
    }
    // ต้องมีการเปลี่ยนแปลงชื่อหรือนามสกุลเท่านั้น
    const hasNameChanged = (formData.firstName !== originalData.firstName) || (formData.lastName !== originalData.lastName);
    if (!hasNameChanged) {
      toast.error('กรุณากรอกชื่อ - นามสกุล ที่ท่านต้องการแก้ไข');
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
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6"
          >
            <div className="flex">
              <div className="ml-3">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-yellow-700"
                >
                  คำขอแก้ไขข้อมูลของคุณกำลังรอการอนุมัติ
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow rounded-lg p-6 mb-6"
      >
        <div className="py-16 flex flex-col items-center justify-center text-gray-600">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner className="text-blue-600 mb-3" size={28} />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-medium"
          >
            กำลังโหลดข้อมูล...
          </motion.p>
        </div>
      </motion.div>
    );
  }
  
  if (loadingError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow rounded-lg p-6 mb-6"
      >
        <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-red-200 rounded-lg">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FaExclamationCircle className="text-red-500 mb-3" size={28} />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-medium mb-3"
          >
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </motion.p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            ลองใหม่อีกครั้ง
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-blue-800 mb-1"
      >
        ข้อมูลสมาชิก
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-gray-500 text-sm mb-6"
      >
        สำหรับอัปเดตข้อมูลบัญชีสมาชิกของคุณ หากต้องการเปลี่ยนแปลงข้อมูลส่วนตัว กรุณากรอกข้อมูลให้ถูกต้องและครบถ้วน
      </motion.p>
      <div className="space-y-6">
      {/* Toaster สำหรับแจ้งเตือนที่มุมขวาบน */}
      <Toaster position="top-right" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        {getStatusBadge()}
        {/* ส่วนที่ 1: ชื่อ - นามสกุล พร้อมปุ่มส่งคำขอแก้ไข */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          <div className="mb-6 border-b pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="ชื่อ"
                  disabled={updateStatus?.status === 'pending'}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                  placeholder="นามสกุล"
                  disabled={updateStatus?.status === 'pending'}
                />
              </motion.div>
            </div>
            <motion.div 
              className="flex justify-end mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || updateStatus?.status === 'pending'}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      <FaSpinner size={16} />
                    </motion.span>
                    กำลังส่งข้อมูล...
                  </span>
                ) : 'ส่งคำขอแก้ไข'}
              </motion.button>
            </motion.div>
          </div>
        </motion.form>
        {/* ส่วนที่ 2: อีเมลและเบอร์โทร (แสดงเฉยๆ ไม่มีปุ่ม) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล (Username)</label>
            <motion.input
              whileHover={{ scale: 1.01 }}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-900 transition-all duration-200"
              placeholder="อีเมล"
              disabled={true}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <motion.input
              whileHover={{ scale: 1.01 }}
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-900 transition-all duration-200"
              placeholder="เบอร์โทรศัพท์"
              disabled={true}
            />
          </motion.div>
        </div>
      </motion.div>
      {/* Add global animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse {
          animation: pulse 2s infinite ease-in-out;
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
        input:focus, button:focus {
          transition: all 0.2s ease-in-out;
        }
        .page-transition {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
      </div>
    </motion.div>
  );
}