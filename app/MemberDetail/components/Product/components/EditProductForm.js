'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const EditProductForm = ({ 
  companyInfo, 
  onCancel, 
  onSuccess,
  memberType,
  memberGroupCode,
  typeCode
}) => {
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const memberCode = companyInfo.MEMBER_CODE || companyInfo.member_code;
  const companyName = companyInfo.COMPANY_NAME_TH || companyInfo.company_name_th || companyInfo.COMPANY_NAME || companyInfo.company_name || '';
  
  // Load existing products
  useEffect(() => {
    if (companyInfo.PRODUCT_DESC_TH) {
      const formattedProducts = companyInfo.PRODUCT_DESC_TH
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
        .map(item => ({ value: item }));
      
      setProducts(formattedProducts);
    }
  }, [companyInfo]);

  const handleAddProduct = () => {
    if (products.length >= 10) {
      toast.warning('สามารถเพิ่มสินค้าได้สูงสุด 10 รายการเท่านั้น');
      return;
    }
    
    setProducts([...products, { value: '' }]);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const handleProductChange = (index, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { value };
    setProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate products
    const validProducts = products.filter(p => p.value.trim() !== '');
    if (validProducts.length === 0) {
      setErrorMessage('กรุณาระบุข้อมูลสินค้าอย่างน้อย 1 รายการ');
      return;
    }
    
    // Format products for submission
    const productValues = validProducts.map(p => p.value.trim());
    
    // Prepare request data
    const requestData = {
      member_code: memberCode,
      company_name: companyName,
      member_type: memberType,
      member_group_code: memberGroupCode,
      type_code: typeCode,
      old_products: companyInfo.PRODUCT_DESC_TH || '',
      new_products: productValues.join(', ')
    };
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/member/request-product-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการส่งคำขอแก้ไขข้อมูลสินค้า');
      }
      
      setSuccessMessage('ส่งคำขอแก้ไขข้อมูลสินค้าสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ');
      toast.success('ส่งคำขอแก้ไขข้อมูลสินค้าสำเร็จ');
      
      // Call success callback after a delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting product update request:', error);
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการส่งคำขอแก้ไขข้อมูลสินค้า');
      toast.error(error.message || 'เกิดข้อผิดพลาดในการส่งคำขอแก้ไขข้อมูลสินค้า');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">แก้ไขข้อมูลสินค้า/ผลิตภัณฑ์</h3>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">
            สามารถเพิ่มสินค้าได้สูงสุด 10 รายการ
          </p>
          
          {products.map((product, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={product.value}
                onChange={(e) => handleProductChange(index, e.target.value)}
                placeholder={`สินค้า/ผลิตภัณฑ์ ${index + 1}`}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={255}
              />
              <button
                type="button"
                onClick={() => handleRemoveProduct(index)}
                className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
                title="ลบรายการ"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          
          {products.length < 10 && (
            <button
              type="button"
              onClick={handleAddProduct}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              เพิ่มสินค้า
            </button>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 border-t pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอแก้ไข'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditProductForm;
