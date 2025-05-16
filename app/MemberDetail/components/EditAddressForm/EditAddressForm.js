'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';

// Import components
import { 
  AddressFormHeader, 
  SuccessMessage, 
  WarningMessage, 
  ErrorMessage, 
  ThaiAddressFields, 
  EnglishAddressFields, 
  ContactFields 
} from './components';

/**
 * Main EditAddressForm component that orchestrates all the child components
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
  useEffect(() => {
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
  }, [address, addrCode, memberCode, compPersonCode, registCode, memberType, memberGroupCode, typeCode]);
  
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
    
    // ตรวจสอบว่ามี user object หรือไม่
    if (!user || !user.id) {
      console.error('User object is missing or has no ID');
      setErrorMessage('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      setIsSubmitting(false);
      return;
    }
    
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
        memberCode: memberCode || '', // ตรวจสอบว่ามีค่าหรือไม่
        compPersonCode: compPersonCode || '', // ตรวจสอบว่ามีค่าหรือไม่
        registCode: registCode || '', // ตรวจสอบว่ามีค่าหรือไม่
        memberType: memberType || '000', // ตรวจสอบว่ามีค่าหรือไม่
        memberGroupCode: memberGroupCode || '', // ตรวจสอบว่ามีค่าหรือไม่
        typeCode: typeCode || '000', // ตรวจสอบว่ามีค่าหรือไม่
        addrCode: addrCode || '001', // ตรวจสอบว่ามีค่าหรือไม่
        addrLang: activeLanguage, // Add the active language (th or en)
        originalAddress: address || {}, // ตรวจสอบว่ามีค่าหรือไม่
        newAddress: filteredFormData
      };
      
      // ตรวจสอบและแสดงค่าที่จะส่งไป API
      console.log('Checking values before sending to API:', {
        memberCode: requestData.memberCode,
        compPersonCode: requestData.compPersonCode,
        registCode: requestData.registCode,
        memberType: requestData.memberType,
        memberGroupCode: requestData.memberGroupCode,
        typeCode: requestData.typeCode,
        addrCode: requestData.addrCode
      });
      
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
    return <SuccessMessage />;
  }
  
  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Form Header with language tabs */}
      <AddressFormHeader 
        addrCode={addrCode}
        activeLanguage={activeLanguage}
        handleLanguageChange={handleLanguageChange}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
      
      {/* Error Message */}
      <ErrorMessage message={errorMessage} />
      
      {/* Success Indicator */}
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
      
      {/* Warning Message */}
      <WarningMessage itemVariants={itemVariants} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section headers */}
        <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeLanguage === 'th' ? 'ข้อมูลที่อยู่' : 'Address Information'}
          </h3>
        </div>
        
        {/* Address Fields based on active language */}
        {activeLanguage === 'th' ? (
          <ThaiAddressFields 
            formData={formData} 
            handleChange={handleChange} 
            itemVariants={itemVariants} 
          />
        ) : (
          <EnglishAddressFields 
            formData={formData} 
            handleChange={handleChange} 
            itemVariants={itemVariants} 
          />
        )}
        
        {/* Contact Fields */}
        <ContactFields 
          formData={formData} 
          handleChange={handleChange} 
          itemVariants={itemVariants} 
          activeLanguage={activeLanguage} 
        />
      </div>
    </motion.form>
  );
}