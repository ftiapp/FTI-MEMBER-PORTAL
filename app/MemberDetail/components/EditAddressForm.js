'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * Form component for editing address information
 * Only ADDR_CODE 001 and 002 can be edited
 * 
 * @param {Object} props Component properties
 * @param {Object} props.address The address object to edit
 * @param {string} props.addrCode The address code (001 or 002)
 * @param {string} props.memberCode The member code
 * @param {string} props.memberType The member type (000, 100, 200)
 * @param {string} props.memberGroupCode The member group code within the member type
 * @param {string} props.typeCode The specific group code within the member type
 * @param {Function} props.onCancel Function to call when canceling edit
 * @param {Function} props.onSuccess Function to call after successful submission
 */
export default function EditAddressForm({ 
  address, 
  addrCode, 
  memberCode,
  memberType,
  memberGroupCode,
  typeCode,
  onCancel,
  onSuccess
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ADDR_NO: '',
    ADDR_MOO: '',
    ADDR_SOI: '',
    ADDR_ROAD: '',
    ADDR_SUB_DISTRICT: '',
    ADDR_DISTRICT: '',
    ADDR_PROVINCE_NAME: '',
    ADDR_POSTCODE: '',
    ADDR_TELEPHONE: '',
    ADDR_FAX: '',
    ADDR_EMAIL: '',
    ADDR_WEBSITE: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Initialize form data from address
  useEffect(() => {
    if (address) {
      setFormData({
        ADDR_NO: address.ADDR_NO || '',
        ADDR_MOO: address.ADDR_MOO || '',
        ADDR_SOI: address.ADDR_SOI || '',
        ADDR_ROAD: address.ADDR_ROAD || '',
        ADDR_SUB_DISTRICT: address.ADDR_SUB_DISTRICT || '',
        ADDR_DISTRICT: address.ADDR_DISTRICT || '',
        ADDR_PROVINCE_NAME: address.ADDR_PROVINCE_NAME || '',
        ADDR_POSTCODE: address.ADDR_POSTCODE || '',
        ADDR_TELEPHONE: address.ADDR_TELEPHONE || '',
        ADDR_FAX: address.ADDR_FAX || '',
        ADDR_EMAIL: address.ADDR_EMAIL || '',
        ADDR_WEBSITE: address.ADDR_WEBSITE || ''
      });
    }
  }, [address]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(''); // Clear any previous error messages
    
    try {
      // Prepare data for API
      const requestData = {
        userId: user?.id, // เพิ่ม userId จาก user context
        memberCode,
        memberType,
        memberGroupCode,
        typeCode,
        addrCode,
        originalAddress: address,
        newAddress: formData
      };
      
      // Call API to submit address update request
      const response = await fetch('/api/member/request-address-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitSuccess(true);
        // Call onSuccess callback after 2 seconds to show success message
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        console.error('Failed to submit address update request:', data.message);
        setErrorMessage(data.message || 'เกิดข้อผิดพลาดในการส่งคำขอแก้ไขที่อยู่');
      }
    } catch (error) {
      console.error('Error submitting address update request:', error);
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  // If success, show success message
  if (submitSuccess) {
    return (
      <motion.div
        className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-lg font-medium text-green-800">
              ส่งคำขอแก้ไขที่อยู่เรียบร้อยแล้ว
            </p>
            <p className="text-sm text-green-700 mt-1">
              คำขอของคุณจะถูกส่งให้ผู้ดูแลระบบตรวจสอบและอนุมัติต่อไป
            </p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-6 pb-3 border-b">
        <h3 className="text-xl font-semibold text-blue-700">
          แก้ไขที่อยู่ {addrCode === '001' ? 'สำหรับติดต่อ (ทะเบียน)' : 'สำหรับจัดส่งเอกสาร'}
        </h3>
        
        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded">
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}
        
        <div className="flex space-x-2">
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            <FaTimes className="mr-2" />
            ยกเลิก
          </motion.button>
          
          <motion.button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            <FaSave className="mr-2" />
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'บันทึกการแก้ไข'}
          </motion.button>
        </div>
      </div>
      
      {submitSuccess && (
        <motion.div 
          className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" />
            <p>คำขอแก้ไขที่อยู่ถูกส่งเรียบร้อยแล้ว กรุณารอการตรวจสอบจากเจ้าหน้าที่</p>
          </div>
        </motion.div>
      )}
      
      <motion.div
        className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-md"
        variants={itemVariants}
      >
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-2 text-blue-500" />
          <p>การแก้ไขที่อยู่จะด้รับการตรวจสอบและอนุมัติจากผู้ดูแลระบบ ภายใน 1-2 วันทำการ</p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* บ้านเลขที่ */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_NO">
            บ้านเลขที่
          </label>
          <input
            type="text"
            id="ADDR_NO"
            name="ADDR_NO"
            value={formData.ADDR_NO}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* หมู่ */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_MOO">
            หมู่
          </label>
          <input
            type="text"
            id="ADDR_MOO"
            name="ADDR_MOO"
            value={formData.ADDR_MOO}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* ซอย */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_SOI">
            ซอย
          </label>
          <input
            type="text"
            id="ADDR_SOI"
            name="ADDR_SOI"
            value={formData.ADDR_SOI}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* ถนน */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_ROAD">
            ถนน
          </label>
          <input
            type="text"
            id="ADDR_ROAD"
            name="ADDR_ROAD"
            value={formData.ADDR_ROAD}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* ตำบล/แขวง */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_SUB_DISTRICT">
            ตำบล/แขวง
          </label>
          <input
            type="text"
            id="ADDR_SUB_DISTRICT"
            name="ADDR_SUB_DISTRICT"
            value={formData.ADDR_SUB_DISTRICT}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* อำเภอ/เขต */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_DISTRICT">
            อำเภอ/เขต
          </label>
          <input
            type="text"
            id="ADDR_DISTRICT"
            name="ADDR_DISTRICT"
            value={formData.ADDR_DISTRICT}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* จังหวัด */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_PROVINCE_NAME">
            จังหวัด
          </label>
          <input
            type="text"
            id="ADDR_PROVINCE_NAME"
            name="ADDR_PROVINCE_NAME"
            value={formData.ADDR_PROVINCE_NAME}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* รหัสไปรษณีย์ */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_POSTCODE">
            รหัสไปรษณีย์
          </label>
          <input
            type="text"
            id="ADDR_POSTCODE"
            name="ADDR_POSTCODE"
            value={formData.ADDR_POSTCODE}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* โทรศัพท์ */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_TELEPHONE">
            โทรศัพท์
          </label>
          <input
            type="text"
            id="ADDR_TELEPHONE"
            name="ADDR_TELEPHONE"
            value={formData.ADDR_TELEPHONE}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* โทรสาร */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_FAX">
            โทรสาร
          </label>
          <input
            type="text"
            id="ADDR_FAX"
            name="ADDR_FAX"
            value={formData.ADDR_FAX}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* อีเมล */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_EMAIL">
            อีเมล
          </label>
          <input
            type="text"
            id="ADDR_EMAIL"
            name="ADDR_EMAIL"
            value={formData.ADDR_EMAIL}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
        
        {/* เว็บไซต์ */}
        <motion.div className="mb-4" variants={itemVariants}>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_WEBSITE">
            เว็บไซต์
          </label>
          <input
            type="text"
            id="ADDR_WEBSITE"
            name="ADDR_WEBSITE"
            value={formData.ADDR_WEBSITE}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </motion.div>
      </div>
    </motion.form>
  );
}
