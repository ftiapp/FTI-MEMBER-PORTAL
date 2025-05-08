'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaBuilding, FaMapSigns, FaRoad, FaMapMarkerAlt, FaPhone, FaFax, FaEnvelope, FaGlobe, FaEdit, FaExclamationTriangle, FaInfoCircle, FaSave, FaTimes, FaCheckCircle, FaPrint } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * Address tab content for the member detail page with improved layout
 * @param {Object} addresses - Object containing address data
 * @param {string} memberCode - Member code
 * @param {string} memberType - Member type (000, 100, 200)
 * @param {string} memberGroupCode - Member group code
 * @param {string} typeCode - Specific type code within member type
 */
export default function AddressTabContent({ addresses = {}, memberCode, memberType, memberGroupCode, typeCode }) {
  // Ensure addresses is an object
  const safeAddresses = addresses && typeof addresses === 'object' ? addresses : {};
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  // Helper function to get address type name
  const getAddressTypeName = (code) => {
    switch (code) {
      case '001':
        return 'ที่อยู่สำหรับติดต่อ (ทะเบียน)';
      case '002':
        return 'ที่อยู่สำหรับจัดส่งเอกสาร';
      case '003':
        return 'ที่อยู่สำหรับออกใบกำกับภาษี';
      default:
        return `ที่อยู่ ${code}`;
    }
  };
  
  // Format the complete address for display
  const formatFullAddress = (address) => {
    if (!address) return '';
    
    // ในกรณีที่ ADDR_NO มีข้อมูลที่อยู่เต็มแล้ว ให้แสดงเฉพาะ ADDR_NO
    if (address.ADDR_NO && address.ADDR_NO.includes('ถนน') && address.ADDR_NO.includes('แขวง')) {
      return address.ADDR_NO;
    }
    
    const parts = [];
    if (address.ADDR_NO) parts.push(`${address.ADDR_NO}`);
    if (address.ADDR_MOO) parts.push(`หมู่ ${address.ADDR_MOO}`);
    if (address.ADDR_SOI) parts.push(`ซอย ${address.ADDR_SOI}`);
    if (address.ADDR_ROAD) parts.push(`${address.ADDR_ROAD}`);
    if (address.ADDR_SUB_DISTRICT) parts.push(`${address.ADDR_SUB_DISTRICT}`);
    if (address.ADDR_DISTRICT) parts.push(`${address.ADDR_DISTRICT}`);
    if (address.ADDR_PROVINCE_NAME) parts.push(`${address.ADDR_PROVINCE_NAME}`);
    if (address.ADDR_POSTCODE) parts.push(`${address.ADDR_POSTCODE}`);
    
    return parts.join(' ');
  };
  
  // Initialize with first address if available and add console log for debugging
  useEffect(() => {
    console.log('Addresses received:', addresses);
    
    if (addresses && Object.keys(addresses).length > 0) {
      const firstKey = Object.keys(addresses)[0];
      console.log('Setting selected address to:', firstKey);
      setSelectedAddress(firstKey);
      
      // Initialize form data if address exists
      if (addresses[firstKey]) {
        initializeFormData(addresses[firstKey]);
      }
    } else {
      console.log('No addresses found in props');
    }
  }, [addresses]);
  
  // Initialize form data from address
  const initializeFormData = (address) => {
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
  };
  
  // Check if addresses exist and if selected address exists
  const hasAddresses = addresses && Object.keys(addresses).length > 0;
  const selectedAddressExists = hasAddresses && selectedAddress && addresses[selectedAddress];
  
  // Debug log current state
  useEffect(() => {
    console.log('Current state:', { 
      hasAddresses, 
      selectedAddress, 
      selectedAddressExists,
      selectedAddressData: selectedAddressExists ? addresses[selectedAddress] : null 
    });
  }, [hasAddresses, selectedAddress, selectedAddressExists, addresses]);
  
  // Check if address is editable (only 001 and 002 can be edited)
  const isEditable = selectedAddress === '001' || selectedAddress === '002';
  
  // Handle input change in edit form
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
        userId: user?.id,
        memberCode,
        memberType,
        memberGroupCode,
        typeCode,
        addrCode: selectedAddress,
        originalAddress: addresses[selectedAddress],
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
          setIsEditMode(false);
          setSubmitSuccess(false);
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
  
  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Check if there's a pending address update request
  const checkPendingRequest = async () => {
    if (!user?.id || !isEditable || !selectedAddress) return;
    
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/member/check-pending-address-update?userId=${user.id}&memberCode=${memberCode}&memberType=${memberType}&memberGroupCode=${memberGroupCode}&typeCode=${typeCode}&addrCode=${selectedAddress}`);
      const data = await response.json();
      
      setHasPendingRequest(data.hasPendingRequest);
    } catch (error) {
      console.error('Error checking pending address update:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };
  
  // Check for pending requests when the selected address changes
  useEffect(() => {
    if (isEditable && selectedAddress) {
      checkPendingRequest();
    } else {
      setHasPendingRequest(false);
    }
    
    // Reset edit mode when changing address
    setIsEditMode(false);
    
    // Initialize form data for the selected address
    if (selectedAddress && addresses[selectedAddress]) {
      initializeFormData(addresses[selectedAddress]);
    }
  }, [selectedAddress, user?.id, memberCode, memberType, memberGroupCode, typeCode]);
  
  return (
    <motion.div 
      className="bg-gray-50 p-6 rounded-lg shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Address type selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {hasAddresses && Object.keys(addresses).map((addrCode) => (
          <motion.button
            key={addrCode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedAddress === addrCode 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => {
              setSelectedAddress(addrCode);
              setIsEditing(false); // Exit edit mode when changing address
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            variants={itemVariants}
          >
            {getAddressTypeName(addrCode)}
          </motion.button>
        ))}
      </div>
      
      {/* Address content */}
      {/* Debug info bar */}
      {(hasAddresses && !selectedAddressExists) && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-300 flex items-center text-sm">
          <FaInfoCircle className="text-yellow-500 mr-2 flex-shrink-0" />
          <div>
            <p className="font-semibold">ข้อมูลการแก้ไขจุดบกพร่อง:</p>
            <p>พบที่อยู่ ({Object.keys(addresses).length}) แต่ไม่พบข้อมูลที่อยู่ที่เลือก ({selectedAddress})</p>
            <p className="mt-1 text-xs">รหัสที่อยู่ที่มี: {Object.keys(addresses).join(', ')}</p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {hasAddresses ? (
          <motion.div 
            key={selectedAddress || 'default'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg border border-gray-100 p-6"
          >
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-1">
                  {getAddressTypeName(selectedAddress || '')}
                </h3>
                <p className="text-gray-500 text-sm">
                  รหัสที่อยู่: {selectedAddress || ''}
                </p>
              </div>
              
              {isEditable && (
                <div className="flex space-x-2">
                  {hasPendingRequest ? (
                    <motion.div 
                      className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <FaExclamationTriangle className="mr-2 text-yellow-500" />
                      <span className="text-sm">คำขอแก้ไขกำลังรอการอนุมัติ</span>
                    </motion.div>
                  ) : (
                    <motion.button
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isCheckingStatus}
                    >
                      <FaEdit className="mr-2" />
                      {isCheckingStatus ? 'กำลังตรวจสอบ...' : 'แก้ไขที่อยู่'}
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!isEditMode}
                  >
                    <FaPrint className="mr-2" />
                    พิมพ์
                  </motion.button>
                </div>
              )}
            </div>
            
            {/* Edit form */}
            {isEditMode && (
              <motion.form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6 pb-3 border-b">
                  <h3 className="text-xl font-semibold text-blue-700">
                    แก้ไขที่อยู่ {selectedAddress === '001' ? 'สำหรับติดต่อ (ทะเบียน)' : 'สำหรับจัดส่งเอกสาร'}
                  </h3>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      type="button"
                      onClick={() => setIsEditMode(false)}
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
                
                {/* Error message */}
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded">
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                )}
                
                {/* Success message */}
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center">
                    <FaExclamationTriangle className="mr-2 text-blue-500" />
                    <p>การแก้ไขที่อยู่จะต้องได้รับการตรวจสอบและอนุมัติจากผู้ดูแลระบบก่อน จึงจะมีผลในระบบ</p>
                  </div>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* บ้านเลขที่ */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* หมู่ */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* ซอย */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* ถนน */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* ตำบล/แขวง */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* อำเภอ/เขต */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* จังหวัด */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* รหัสไปรษณีย์ */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* โทรศัพท์ */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* โทรสาร */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* อีเมล */}
                  <div className="mb-4">
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
                  </div>
                  
                  {/* เว็บไซต์ */}
                  <div className="mb-4">
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
                  </div>
                </div>
              </motion.form>
            )}
            
            {/* Address information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
                ข้อมูลที่อยู่
              </h4>
              
              {/* Full address at the top */}
              <motion.div 
                className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-100 shadow-md" 
                variants={itemVariants}
              >
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-blue-600 flex-shrink-0 text-xl" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-800 text-lg mb-2">ที่อยู่เต็ม</p>
                    {selectedAddressExists ? (
                      <>
                        <p className="text-gray-800 break-words text-lg">
                          {addresses[selectedAddress]?.ADDR_NO || 'ไม่ระบุ'}
                        </p>
                        {addresses[selectedAddress]?.ADDR_ROAD && (
                          <p className="text-gray-800 break-words text-lg mt-1">
                            {addresses[selectedAddress].ADDR_ROAD}
                          </p>
                        )}
                        <p className="text-gray-800 break-words text-lg mt-1">
                          {addresses[selectedAddress]?.ADDR_SUB_DISTRICT || ''} {addresses[selectedAddress]?.ADDR_DISTRICT || ''} {addresses[selectedAddress]?.ADDR_PROVINCE_NAME || ''} {addresses[selectedAddress]?.ADDR_POSTCODE || ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">ไม่พบข้อมูลที่อยู่</p>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Address information grid */}
              {selectedAddressExists && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* House Number */}
                  {addresses[selectedAddress].ADDR_NO && (
                    <motion.div 
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all" 
                      variants={itemVariants}
                    >
                      <div className="flex items-center mb-2">
                        <FaHome className="text-blue-500 flex-shrink-0 mr-2" />
                        <p className="font-semibold text-blue-700 text-base">ที่อยู่</p>
                      </div>
                      <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_NO}</p>
                    </motion.div>
                  )}
                  
                  {/* Road */}
                  {addresses[selectedAddress].ADDR_ROAD && (
                    <motion.div 
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all" 
                      variants={itemVariants}
                    >
                      <div className="flex items-center mb-2">
                        <FaRoad className="text-blue-500 flex-shrink-0 mr-2" />
                        <p className="font-semibold text-blue-700 text-base">ถนน</p>
                      </div>
                      <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_ROAD}</p>
                    </motion.div>
                  )}
                  
                  {/* Sub District */}
                  {addresses[selectedAddress].ADDR_SUB_DISTRICT && (
                    <motion.div 
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all" 
                      variants={itemVariants}
                    >
                      <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
                        <p className="font-semibold text-blue-700 text-base">ตำบล/แขวง</p>
                      </div>
                      <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_SUB_DISTRICT}</p>
                    </motion.div>
                  )}
                  
                  {/* District */}
                  {addresses[selectedAddress].ADDR_DISTRICT && (
                    <motion.div 
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all" 
                      variants={itemVariants}
                    >
                      <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
                        <p className="font-semibold text-blue-700 text-base">อำเภอ/เขต</p>
                      </div>
                      <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_DISTRICT}</p>
                    </motion.div>
                  )}
                  
                  {/* Province */}
                  {addresses[selectedAddress].ADDR_PROVINCE_NAME && (
                    <motion.div 
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all" 
                      variants={itemVariants}
                    >
                      <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
                        <p className="font-semibold text-blue-700 text-base">จังหวัด</p>
                      </div>
                      <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_PROVINCE_NAME}</p>
                    </motion.div>
                  )}
                  
                  {/* Postal Code */}
                  {addresses[selectedAddress].ADDR_POSTCODE && (
                    <motion.div 
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow hover:shadow-md transition-all" 
                      variants={itemVariants}
                    >
                      <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-blue-500 flex-shrink-0 mr-2" />
                        <p className="font-semibold text-blue-700 text-base">รหัสไปรษณีย์</p>
                      </div>
                      <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_POSTCODE}</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            
            {/* Contact information */}
            {selectedAddressExists && (
              <motion.div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
                  รายละเอียดการติดต่อ
                </h4>
                
                {/* Contact information grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <motion.div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all" variants={itemVariants}>
                    <FaPhone className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-700 mb-2">โทรศัพท์</p>
                      <p className="text-gray-800 text-lg">{addresses[selectedAddress].ADDR_TELEPHONE || '-'}</p>
                    </div>
                  </motion.div>
                  
                  {/* Fax */}
                  {addresses[selectedAddress].ADDR_FAX && (
                    <motion.div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all" variants={itemVariants}>
                      <FaFax className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-700 mb-2">โทรสาร</p>
                        <p className="text-gray-800 text-lg">{addresses[selectedAddress].ADDR_FAX}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Email with hyperlink */}
                  <motion.div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all" variants={itemVariants}>
                    <FaEnvelope className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-blue-700 mb-2">อีเมล</p>
                      {addresses[selectedAddress].ADDR_EMAIL ? (
                        <motion.a 
                          href={`mailto:${addresses[selectedAddress].ADDR_EMAIL}`}
                          className="text-blue-600 hover:underline break-words block text-ellipsis overflow-hidden text-lg"
                          whileHover={{ scale: 1.01 }}
                        >
                          {addresses[selectedAddress].ADDR_EMAIL}
                        </motion.a>
                      ) : (
                        <p className="text-gray-800 text-lg">-</p>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Website with hyperlink */}
                  {addresses[selectedAddress].ADDR_WEBSITE && (
                    <motion.div className="flex items-start bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all" variants={itemVariants}>
                      <FaGlobe className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-semibold text-blue-700 mb-2">เว็บไซต์</p>
                        <motion.a 
                          href={addresses[selectedAddress].ADDR_WEBSITE.startsWith('http') 
                            ? addresses[selectedAddress].ADDR_WEBSITE 
                            : `http://${addresses[selectedAddress].ADDR_WEBSITE}`
                          } 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-words block text-ellipsis overflow-hidden text-lg"
                          whileHover={{ scale: 1.01 }}
                        >
                          {addresses[selectedAddress].ADDR_WEBSITE}
                        </motion.a>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="py-16 text-center text-gray-500 bg-white rounded-lg shadow-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FaMapMarkerAlt className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="font-medium text-xl mb-2">ไม่พบข้อมูลที่อยู่</p>
            <p className="text-gray-400">กรุณาตรวจสอบรหัสที่อยู่หรือติดต่อผู้ดูแลระบบ</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}