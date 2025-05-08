'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaBuilding, FaMapSigns, FaRoad, FaMapMarkerAlt, FaPhone, FaFax, FaEnvelope, FaGlobe, FaEdit, FaExclamationTriangle, FaInfoCircle, FaPrint } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import EditAddressForm from './EditAddressForm';

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
  
  // Debug all addresses data
  console.log('All addresses data:', addresses);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  // Handle address selection
  const handleAddressSelect = (addrCode) => {
    setSelectedAddress(addrCode);
    setIsEditMode(false); // Reset edit mode when changing address
    
    // Debug selected address data
    console.log('Selected address data:', {
      addrCode,
      addressData: addresses[addrCode],
      compPersonCode: addresses[addrCode]?.COMP_PERSON_CODE
    });
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
      
      // ไม่ต้อง initialize form data เนื่องจากเราใช้ EditAddressForm แทน
    } else {
      console.log('No addresses found in props');
    }
  }, [addresses]);
  
  // ลบฟังก์ชัน initializeFormData เนื่องจากจะใช้ EditAddressForm แทน
  
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
  
  // ลบฟังก์ชัน handleChange และ handleSubmit เนื่องจากจะใช้ EditAddressForm แทน
  
  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Check if there's a pending address update request
  const checkPendingRequest = async (lang = 'th') => {
    if (!user?.id || !isEditable || !selectedAddress) return;
    
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/member/check-pending-address-update?userId=${user.id}&memberCode=${memberCode}&memberType=${memberType}&memberGroupCode=${memberGroupCode}&typeCode=${typeCode}&addrCode=${selectedAddress}&addrLang=${lang}`);
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
            onClick={() => handleAddressSelect(addrCode)}
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
              <EditAddressForm
                address={addresses[selectedAddress]}
                addrCode={selectedAddress}
                memberCode={memberCode}
                compPersonCode={addresses[selectedAddress]?.COMP_PERSON_CODE || ''} // ส่งค่า COMP_PERSON_CODE จากข้อมูลที่อยู่
                registCode={addresses[selectedAddress]?.REGIST_CODE || ''} // ส่งค่า REGIST_CODE จากข้อมูลที่อยู่
                memberType={memberType}
                memberGroupCode={memberGroupCode}
                typeCode={typeCode}
                onCancel={() => setIsEditMode(false)}
                onSuccess={() => {
                  setIsEditMode(false);
                  // รีเฟรชข้อมูลหลังจากแก้ไขสำเร็จ
                  checkPendingRequest();
                }}
              />
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