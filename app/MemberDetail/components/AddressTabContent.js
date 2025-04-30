'use client';

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Address tab content for the member detail page
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

  // Helper function to format address
  const formatAddress = (address) => {
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
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Address navigation */}
      <motion.div className="mb-6" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <motion.h3 
            className="text-lg font-medium text-gray-900"
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
              className={`px-3 py-1 text-xs rounded-full ${
                selectedAddress === addrCode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            className="space-y-4"
            key={selectedAddress}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover="hover"
          >
           
            
            <motion.div className="flex items-start" variants={itemVariants}>
              <FaMapMarkerAlt className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="font-medium">ที่อยู่</p>
                <p className="text-gray-700">{formatAddress(addresses[selectedAddress])}</p>
              </div>
            </motion.div>
            
            <motion.div className="flex items-start" variants={itemVariants}>
              <FaPhone className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="font-medium">โทรศัพท์</p>
                <p className="text-gray-700">{addresses[selectedAddress].ADDR_TELEPHONE || '-'}</p>
              </div>
            </motion.div>
            
            <motion.div className="flex items-start" variants={itemVariants}>
              <FaEnvelope className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="font-medium">อีเมล</p>
                <p className="text-gray-700">{addresses[selectedAddress].ADDR_EMAIL || '-'}</p>
              </div>
            </motion.div>
            
            {addresses[selectedAddress].ADDR_FAX && (
              <motion.div className="flex items-start" variants={itemVariants}>
                <FaPhone className="mt-1 mr-3 text-blue-500" />
                <div>
                  <p className="font-medium">โทรสาร</p>
                  <p className="text-gray-700">{addresses[selectedAddress].ADDR_FAX}</p>
                </div>
              </motion.div>
            )}
            
            {addresses[selectedAddress].ADDR_WEBSITE && (
              <motion.div className="flex items-start" variants={itemVariants}>
                <FaGlobe className="mt-1 mr-3 text-blue-500" />
                <div>
                  <p className="font-medium">เว็บไซต์</p>
                  <p className="text-gray-700">
                    <motion.a 
                      href={addresses[selectedAddress].ADDR_WEBSITE.startsWith('http') 
                        ? addresses[selectedAddress].ADDR_WEBSITE 
                        : `http://${addresses[selectedAddress].ADDR_WEBSITE}`
                      } 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      whileHover={{ scale: 1.03 }}
                    >
                      {addresses[selectedAddress].ADDR_WEBSITE}
                    </motion.a>
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="py-8 text-center text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            ไม่พบข้อมูลที่อยู่สำหรับรหัสที่เลือก
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}