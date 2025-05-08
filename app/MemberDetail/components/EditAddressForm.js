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
 * @param {string} props.compPersonCode The company person code
 * @param {string} props.registCode The registration code
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
  compPersonCode,
  registCode,
  memberType,
  memberGroupCode,
  typeCode,
  onCancel,
  onSuccess
}) {
  // Debug all props on component mount
  console.log('EditAddressForm props on mount:', {
    address,
    addrCode,
    memberCode,
    compPersonCode,
    registCode,
    memberType,
    memberGroupCode,
    typeCode
  });
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Thai address fields
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
    ADDR_WEBSITE: '',
    // English address fields
    ADDR_NO_EN: '',
    ADDR_MOO_EN: '',
    ADDR_SOI_EN: '',
    ADDR_ROAD_EN: '',
    ADDR_SUB_DISTRICT_EN: '',
    ADDR_DISTRICT_EN: '',
    ADDR_PROVINCE_NAME_EN: '',
    ADDR_POSTCODE_EN: '',
    ADDR_TELEPHONE_EN: '',
    ADDR_FAX_EN: '',
    ADDR_EMAIL_EN: '',
    ADDR_WEBSITE_EN: ''
  });
  
  // State to track which language tab is active - default to 'th'
  const [activeLanguage, setActiveLanguage] = useState('th');
  
  // Log when language changes
  const handleLanguageChange = (lang) => {
    console.log('Language changed to:', lang);
    setActiveLanguage(lang);
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Debug props
  useEffect(() => {
    console.log('EditAddressForm props:', { memberCode, compPersonCode, registCode, addrCode, activeLanguage });
  }, [memberCode, compPersonCode, registCode, addrCode, activeLanguage]);

  // Initialize form data from address
  useEffect(() => {
    if (address) {
      setFormData({
        // Thai address fields
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
        ADDR_WEBSITE: address.ADDR_WEBSITE || '',
        // English address fields
        ADDR_NO_EN: address.ADDR_NO_EN || '',
        ADDR_MOO_EN: address.ADDR_MOO_EN || '',
        ADDR_SOI_EN: address.ADDR_SOI_EN || '',
        ADDR_ROAD_EN: address.ADDR_ROAD_EN || '',
        ADDR_SUB_DISTRICT_EN: address.ADDR_SUB_DISTRICT_EN || '',
        ADDR_DISTRICT_EN: address.ADDR_DISTRICT_EN || '',
        ADDR_PROVINCE_NAME_EN: address.ADDR_PROVINCE_NAME_EN || '',
        ADDR_POSTCODE_EN: address.ADDR_POSTCODE_EN || '',
        ADDR_TELEPHONE_EN: address.ADDR_TELEPHONE_EN || '',
        ADDR_FAX_EN: address.ADDR_FAX_EN || '',
        ADDR_EMAIL_EN: address.ADDR_EMAIL_EN || '',
        ADDR_WEBSITE_EN: address.ADDR_WEBSITE_EN || ''
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
    
    console.log('Submitting form with language:', activeLanguage);
    
    try {
      // แยกข้อมูลตามภาษาที่เลือก
      let filteredFormData = {};
      
      if (activeLanguage === 'en') {
        // เลือกเฉพาะฟิลด์ภาษาอังกฤษและเปลี่ยนชื่อฟิลด์ให้ตรงกับที่ต้องการ
        Object.keys(formData).forEach(key => {
          if (key.endsWith('_EN')) {
            // เปลี่ยนชื่อฟิลด์จาก ADDR_XXX_EN เป็น ADDR_XXX
            const newKey = key.replace('_EN', '');
            filteredFormData[newKey] = formData[key];
          } else if (!key.includes('_EN')) {
            // คัดลอกฟิลด์ที่ไม่มีเวอร์ชันภาษาอังกฤษ เช่น เบอร์โทรศัพท์ อีเมล์ เว็บไซต์
            if (key === 'ADDR_TELEPHONE' || key === 'ADDR_FAX' || key === 'ADDR_EMAIL' || key === 'ADDR_WEBSITE') {
              filteredFormData[key] = formData[key];
            }
          }
        });
      } else {
        // เลือกเฉพาะฟิลด์ภาษาไทย
        Object.keys(formData).forEach(key => {
          if (!key.endsWith('_EN')) {
            filteredFormData[key] = formData[key];
          }
        });
      }
      
      // Prepare data for API
      const requestData = {
        userId: user?.id, // เพิ่ม userId จาก user context
        memberCode,
        compPersonCode,
        registCode, // เพิ่ม registCode เข้าไปในข้อมูลที่ส่งไป API
        memberType,
        memberGroupCode,
        typeCode,
        addrCode,
        addrLang: activeLanguage, // Add the active language (th or en)
        originalAddress: address,
        newAddress: filteredFormData
      };
      
      // Debug request data
      console.log('Request data sent to API:', JSON.stringify(requestData, null, 2));
      
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
      <div className="mb-6 pb-3 border-b">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-blue-700">
            แก้ไขที่อยู่ {addrCode === '001' ? 'สำหรับติดต่อ (ทะเบียน)' : 'สำหรับจัดส่งเอกสาร'}
          </h3>
          
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
        
        {/* Language tabs */}
        <div className="flex border-b mb-4">
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm ${activeLanguage === 'th' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleLanguageChange('th')}
          >
            ภาษาไทย
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm ${activeLanguage === 'en' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </button>
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded">
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}
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
        {/* Section headers */}
        <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">ข้อมูลที่อยู่</h3>
        </div>
        
        {activeLanguage === 'th' ? (
          // Thai address fields
          <>
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
            
            {/* Section headers for contact info */}
            <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-800">ข้อมูลติดต่อ</h3>
            </div>
            
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
          </>
        ) : (
          // English address fields
          <>
            {/* House Number */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_NO_EN">
                House Number
              </label>
              <input
                type="text"
                id="ADDR_NO_EN"
                name="ADDR_NO_EN"
                value={formData.ADDR_NO_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Village No. */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_MOO_EN">
                Village No.
              </label>
              <input
                type="text"
                id="ADDR_MOO_EN"
                name="ADDR_MOO_EN"
                value={formData.ADDR_MOO_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Soi/Lane */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_SOI_EN">
                Soi/Lane
              </label>
              <input
                type="text"
                id="ADDR_SOI_EN"
                name="ADDR_SOI_EN"
                value={formData.ADDR_SOI_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Road */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_ROAD_EN">
                Road
              </label>
              <input
                type="text"
                id="ADDR_ROAD_EN"
                name="ADDR_ROAD_EN"
                value={formData.ADDR_ROAD_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Sub-district */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_SUB_DISTRICT_EN">
                Sub-district
              </label>
              <input
                type="text"
                id="ADDR_SUB_DISTRICT_EN"
                name="ADDR_SUB_DISTRICT_EN"
                value={formData.ADDR_SUB_DISTRICT_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* District */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_DISTRICT_EN">
                District
              </label>
              <input
                type="text"
                id="ADDR_DISTRICT_EN"
                name="ADDR_DISTRICT_EN"
                value={formData.ADDR_DISTRICT_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Province */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_PROVINCE_NAME_EN">
                Province
              </label>
              <input
                type="text"
                id="ADDR_PROVINCE_NAME_EN"
                name="ADDR_PROVINCE_NAME_EN"
                value={formData.ADDR_PROVINCE_NAME_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Postal Code */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_POSTCODE_EN">
                Postal Code
              </label>
              <input
                type="text"
                id="ADDR_POSTCODE_EN"
                name="ADDR_POSTCODE_EN"
                value={formData.ADDR_POSTCODE_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Section headers for contact info */}
            <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
            </div>
            
            {/* Telephone */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_TELEPHONE_EN">
                Telephone
              </label>
              <input
                type="text"
                id="ADDR_TELEPHONE_EN"
                name="ADDR_TELEPHONE_EN"
                value={formData.ADDR_TELEPHONE_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Fax */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_FAX_EN">
                Fax
              </label>
              <input
                type="text"
                id="ADDR_FAX_EN"
                name="ADDR_FAX_EN"
                value={formData.ADDR_FAX_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Email */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_EMAIL_EN">
                Email
              </label>
              <input
                type="text"
                id="ADDR_EMAIL_EN"
                name="ADDR_EMAIL_EN"
                value={formData.ADDR_EMAIL_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
            
            {/* Website */}
            <motion.div className="mb-4" variants={itemVariants}>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_WEBSITE_EN">
                Website
              </label>
              <input
                type="text"
                id="ADDR_WEBSITE_EN"
                name="ADDR_WEBSITE_EN"
                value={formData.ADDR_WEBSITE_EN}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
          </>
        )}
      </div>
    </motion.form>
  );
}
