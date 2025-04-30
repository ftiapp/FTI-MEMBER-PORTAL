'use client';

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaFax, FaHome, FaBuilding, FaRoad, FaMapSigns } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Address tab content for the member detail page with improved layout
 */
export default function AddressTabContent({ addresses = {} }) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.02, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }
  };
  
  const [addressIndex, setAddressIndex] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState('');

  // Helper function to get address label
  const getAddressLabel = (code) => {
    switch (code) {
      case '001':
        return 'ที่ตั้งสำนักงาน';
      case '002':
        return 'ที่ตั้งโรงงาน';
      case '003':
        return 'ที่อยู่จัดส่งเอกสาร';
      default:
        return `ที่อยู่ ${code}`;
    }
  };

  // Initialize with first address if available
  useEffect(() => {
    if (addresses && Object.keys(addresses).length > 0) {
      setSelectedAddress(Object.keys(addresses)[0]);
      setAddressIndex(0);
    }
  }, [addresses]);
  
  // Check if addresses exist and have keys
  const hasAddresses = addresses && Object.keys(addresses).length > 0;
  const addressKeys = hasAddresses ? Object.keys(addresses) : [];
  
  // Format the complete address for display at the bottom
  const formatFullAddress = (address) => {
    if (!address) return '';
    
    const parts = [];
    if (address.ADDR_NO) parts.push(`${address.ADDR_NO}`);
    if (address.ADDR_MOO) parts.push(`หมู่ ${address.ADDR_MOO}`);
    if (address.ADDR_SOI) parts.push(`ซอย ${address.ADDR_SOI}`);
    if (address.ADDR_ROAD) parts.push(`ถนน ${address.ADDR_ROAD}`);
    if (address.ADDR_SUB_DISTRICT) parts.push(`ตำบล/แขวง ${address.ADDR_SUB_DISTRICT}`);
    if (address.ADDR_DISTRICT) parts.push(`อำเภอ/เขต ${address.ADDR_DISTRICT}`);
    if (address.ADDR_PROVINCE_NAME) parts.push(`จังหวัด ${address.ADDR_PROVINCE_NAME}`);
    if (address.ADDR_POSTCODE) parts.push(`${address.ADDR_POSTCODE}`);
    
    return parts.join(' ');
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Address navigation */}
      <motion.div className="mb-6" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <motion.h3 
            className="text-xl font-medium text-gray-900"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {hasAddresses ? getAddressLabel(addressKeys[addressIndex]) : 'ไม่พบข้อมูลที่อยู่'}
          </motion.h3>
          
          {hasAddresses && addressKeys.length > 1 && (
            <motion.div 
              className="flex space-x-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.button
                onClick={() => {
                  const newIndex = (addressIndex - 1 + addressKeys.length) % addressKeys.length;
                  setAddressIndex(newIndex);
                  setSelectedAddress(addressKeys[newIndex]);
                }}
                disabled={addressKeys.length <= 1}
                className={`p-2 rounded-full ${addressKeys.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                aria-label="ที่อยู่ก่อนหน้า"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <span className="flex items-center text-sm text-gray-600">
                {addressIndex + 1} / {addressKeys.length}
              </span>
              <motion.button
                onClick={() => {
                  const newIndex = (addressIndex + 1) % addressKeys.length;
                  setAddressIndex(newIndex);
                  setSelectedAddress(addressKeys[newIndex]);
                }}
                disabled={addressKeys.length <= 1}
                className={`p-2 rounded-full ${addressKeys.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                aria-label="ที่อยู่ถัดไป"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </div>
        
        {/* Address type badges */}
        <motion.div 
          className="flex flex-wrap gap-2 mt-3"
          variants={itemVariants}
        >
          {hasAddresses && addressKeys.map((addrCode, index) => (
            <motion.button
              key={addrCode}
              onClick={() => {
                setSelectedAddress(addrCode);
                setAddressIndex(index);
              }}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                selectedAddress === addrCode
                  ? 'bg-blue-600 text-white font-medium shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {getAddressLabel(addrCode)}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Selected address details */}
      <AnimatePresence mode="wait">
        {hasAddresses && selectedAddress && addresses[selectedAddress] ? (
          <motion.div 
            className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm w-full"
            key={selectedAddress}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover="hover"
          >
            {/* Address components with better organization */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
                รายละเอียดที่อยู่
              </h4>
              
              {/* Full address at the top */}
              <motion.div 
                className="bg-gray-50 p-5 rounded-lg mb-6 border border-blue-100 shadow-sm" 
                variants={itemVariants}
              >
                <div className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-700 text-lg mb-2">ที่อยู่เต็ม</p>
                    <p className="text-gray-800 break-words text-base">{formatFullAddress(addresses[selectedAddress])}</p>
                  </div>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {/* House Number */}
                {addresses[selectedAddress].ADDR_NO && (
                  <motion.div 
                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all" 
                    variants={itemVariants}
                  >
                    <div className="flex items-center mb-2">
                      <FaHome className="text-blue-500 flex-shrink-0 mr-2" />
                      <p className="font-semibold text-blue-700 text-base">บ้านเลขที่</p>
                    </div>
                    <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_NO}</p>
                  </motion.div>
                )}
                
                {/* Moo (Village Number) */}
                {addresses[selectedAddress].ADDR_MOO && (
                  <motion.div 
                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all" 
                    variants={itemVariants}
                  >
                    <div className="flex items-center mb-2">
                      <FaBuilding className="text-blue-500 flex-shrink-0 mr-2" />
                      <p className="font-semibold text-blue-700 text-base">หมู่</p>
                    </div>
                    <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_MOO}</p>
                  </motion.div>
                )}
                
                {/* Soi (Alley) */}
                {addresses[selectedAddress].ADDR_SOI && (
                  <motion.div 
                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all" 
                    variants={itemVariants}
                  >
                    <div className="flex items-center mb-2">
                      <FaMapSigns className="text-blue-500 flex-shrink-0 mr-2" />
                      <p className="font-semibold text-blue-700 text-base">ซอย</p>
                    </div>
                    <p className="text-gray-800 text-lg pl-7">{addresses[selectedAddress].ADDR_SOI}</p>
                  </motion.div>
                )}
                
                {/* Road */}
                {addresses[selectedAddress].ADDR_ROAD && (
                  <motion.div 
                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all" 
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
                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all" 
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
                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all" 
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
                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all" 
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
                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all" 
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
            </div>
            
            {/* Contact information */}
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
          </motion.div>
        ) : (
          <motion.div 
            className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium text-lg">ไม่พบข้อมูลที่อยู่สำหรับรหัสที่เลือก</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}