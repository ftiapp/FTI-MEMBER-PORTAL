'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaLanguage } from 'react-icons/fa';

// Import sub-components
import AddressSelector from './components/AddressSelector';
import DebugInfoBar from './components/debugInfoBar';
import AddressHeader from './components/AddressHeader';
import FullAddressDisplay from './components/FullAddressDisplay';
import AddressDetailsGrid from './components/AddressDetailsGrid';
import ContactInfoGrid from './components/ContactInfoGrid';
import EmptyAddressPlaceholder from './components/EmptyAddressPlaceholder';
import EditAddressForm from '../EditAddressForm';

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
  const [language, setLanguage] = useState('th'); // เพิ่ม state สำหรับเก็บภาษาที่เลือก (th หรือ en)
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
  
  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Check if addresses exist and if selected address exists
  const hasAddresses = addresses && Object.keys(addresses).length > 0;
  const selectedAddressExists = hasAddresses && selectedAddress && addresses[selectedAddress];
  
  // Check if address is editable (001, 002, and 003 can be edited)
  const isEditable = selectedAddress === '001' || selectedAddress === '002' || selectedAddress === '003';

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
  
  // Initialize with first address if available
  useEffect(() => {
    console.log('Addresses received:', addresses);
    
    if (addresses && Object.keys(addresses).length > 0) {
      const firstKey = Object.keys(addresses)[0];
      console.log('Setting selected address to:', firstKey);
      setSelectedAddress(firstKey);
    } else {
      console.log('No addresses found in props');
    }
  }, [addresses]);
  
  // Debug log current state
  useEffect(() => {
    console.log('Current state:', { 
      hasAddresses, 
      selectedAddress, 
      selectedAddressExists,
      selectedAddressData: selectedAddressExists ? addresses[selectedAddress] : null 
    });
  }, [hasAddresses, selectedAddress, selectedAddressExists, addresses]);
  
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
      {hasAddresses && (
        <AddressSelector 
          addresses={safeAddresses} 
          selectedAddress={selectedAddress} 
          onAddressSelect={handleAddressSelect} 
        />
      )}
      
      {/* Debug info bar */}
      <DebugInfoBar 
        hasAddresses={hasAddresses} 
        selectedAddressExists={selectedAddressExists} 
        selectedAddress={selectedAddress} 
        addresses={safeAddresses} 
      />
      
      {/* Language Switch */}
      {hasAddresses && selectedAddressExists && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center space-x-2">
            <FaLanguage className="text-blue-500 text-xl" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLanguage('th')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${language === 'th' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${language === 'en' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                EN
              </button>
            </div>
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
            {/* Address Header */}
            <AddressHeader 
              selectedAddress={selectedAddress}
              isEditable={isEditable}
              hasPendingRequest={hasPendingRequest}
              isCheckingStatus={isCheckingStatus}
              setIsEditMode={setIsEditMode}
              handlePrint={handlePrint}
            />
            
            {/* Edit form */}
            {isEditMode && selectedAddressExists && (
              <EditAddressForm
                address={addresses[selectedAddress]}
                addrCode={selectedAddress}
                memberCode={memberCode}
                compPersonCode={addresses[selectedAddress]?.COMP_PERSON_CODE || ''} 
                registCode={addresses[selectedAddress]?.REGIST_CODE || ''} 
                memberType={memberType}
                memberGroupCode={memberGroupCode}
                typeCode={typeCode}
                activeLanguage={language} /* ส่งค่า language ไปให้ EditAddressForm */
                onCancel={() => setIsEditMode(false)}
                onSuccess={() => {
                  setIsEditMode(false);
                  // รีเฟรชข้อมูลหลังจากแก้ไขสำเร็จ
                  checkPendingRequest();
                }}
              />
            )}
            
            {/* Address information */}
            {!isEditMode && selectedAddressExists && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-blue-600 mb-4 border-b pb-2">
                  ข้อมูลที่อยู่
                </h4>
                
                {/* Full address at the top */}
                <FullAddressDisplay 
                  address={addresses[selectedAddress]}
                  language={language}
                />
                
                {/* Address information grid */}
                <AddressDetailsGrid 
                  address={addresses[selectedAddress]}
                  language={language}
                />
                
                {/* Contact information */}
                <ContactInfoGrid 
                  address={addresses[selectedAddress]}
                  language={language}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <EmptyAddressPlaceholder />
        )}
      </AnimatePresence>
    </motion.div>
  );
}