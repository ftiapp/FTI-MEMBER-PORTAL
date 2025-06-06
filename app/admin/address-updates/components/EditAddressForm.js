'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EditAddressForm({ addressData, addrLang, onSave, isEditing, setIsEditing }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize form data when addressData changes
  useEffect(() => {
    if (addressData) {
      setFormData({ ...addressData });
    }
  }, [addressData]);

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
    setErrorMessage('');
    
    try {
      // Call the onSave function with the updated form data
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving address data:', error);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData(addressData);
    setIsEditing(false);
  };

  // Get field label based on field name
  const getFieldLabel = (fieldName) => {
    const fieldLabels = {
      ADDR_NO: 'เลขที่',
      ADDR_MOO: 'หมู่ที่',
      ADDR_SOI: 'ซอย',
      ADDR_ROAD: 'ถนน',
      ADDR_SUB_DISTRICT: 'แขวง/ตำบล',
      ADDR_DISTRICT: 'เขต/อำเภอ',
      ADDR_PROVINCE_NAME: 'จังหวัด',
      ADDR_POSTCODE: 'รหัสไปรษณีย์',
      ADDR_TELEPHONE: 'โทรศัพท์',
      ADDR_FAX: 'แฟกซ์',
      ADDR_EMAIL: 'อีเมล',
      ADDR_WEBSITE: 'เว็บไซต์'
    };
    return fieldLabels[fieldName] || fieldName;
  };

  // Define the order of fields to display
  const fieldOrder = [
    'ADDR_NO', 'ADDR_MOO', 'ADDR_SOI', 'ADDR_ROAD', 
    'ADDR_SUB_DISTRICT', 'ADDR_DISTRICT', 'ADDR_PROVINCE_NAME', 'ADDR_POSTCODE',
    'ADDR_TELEPHONE', 'ADDR_FAX', 'ADDR_EMAIL', 'ADDR_WEBSITE'
  ];

  return (
    <motion.div
      className="bg-white rounded-lg p-4 border border-blue-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-bold text-lg mb-4 text-blue-700">แก้ไขข้อมูลที่อยู่</h3>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {fieldOrder.map((fieldName) => (
            <div key={fieldName} className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getFieldLabel(fieldName)}
              </label>
              <input
                type={fieldName === 'ADDR_EMAIL' ? 'email' : 'text'}
                name={fieldName}
                value={formData[fieldName] || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium"
            disabled={isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium flex items-center justify-center disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกการแก้ไข'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
