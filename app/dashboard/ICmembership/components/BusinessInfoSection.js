'use client';

import { useState, useEffect } from 'react';

export default function BusinessInfoSection({
  formData,
  errors,
  handleChange,
  handleCheckboxChange,
  businessCategories,
  isLoading
}) {
  // Auto scroll to first error
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const errorFields = Object.keys(errors);
      const firstErrorField = errorFields[0];
      const firstErrorElement = document.getElementById(firstErrorField);
      
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        // Optional: Focus on the input field
        firstErrorElement.focus();
      }
    }
  }, [errors]);

  // จัดการการเพิ่ม/ลบรายการผลิตภัณฑ์/บริการ
  const handleAddProduct = () => {
    if (formData.products && formData.products.length < 10) {
      const updatedProducts = [...(formData.products || []), { thai: '', english: '' }];
      handleChange({
        target: {
          name: 'products',
          value: updatedProducts
        }
      });
    }
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    handleChange({
      target: {
        name: 'products',
        value: updatedProducts
      }
    });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...(formData.products || [])];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    handleChange({
      target: {
        name: 'products',
        value: updatedProducts
      }
    });
  };

  // ตรวจสอบว่ามีรายการผลิตภัณฑ์หรือไม่ ถ้าไม่มีให้สร้างรายการแรก
  const products = formData.products && formData.products.length > 0 
    ? formData.products 
    : [{ thai: '', english: '' }];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">ข้อมูลธุรกิจ</h2>
      
      {/* ประเภทกิจการ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ประเภทกิจการ
          <span className="text-xs text-gray-500 ml-1">(เลือกได้มากกว่า 1)</span>
        </label>
        
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {businessCategories.map((category) => (
              <div key={category.id} className="flex items-start">
                <input
                  type="checkbox"
                  id={`business-category-${category.id}`}
                  name="businessCategories"
                  value={category.id}
                  checked={formData.businessCategories && formData.businessCategories.includes(category.id)}
                  onChange={handleCheckboxChange}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`business-category-${category.id}`} className="ml-2 text-sm text-gray-700">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
        
        {/* อื่นๆ โปรดระบุ */}
        {formData.businessCategories && formData.businessCategories.includes('other') && (
          <div className="mt-3 relative">
            <label htmlFor="businessCategoryOther" className="block text-sm font-medium text-gray-700 mb-1">
              โปรดระบุประเภทกิจการอื่นๆ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="businessCategoryOther"
              name="businessCategoryOther"
              value={formData.businessCategoryOther || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.businessCategoryOther ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="ระบุประเภทกิจการอื่นๆ"
            />
            {errors.businessCategoryOther && (
              <div className="absolute top-0 right-0 -mt-1 -mr-1">
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs">
                  <div className="relative">
                    {errors.businessCategoryOther}
                    {/* Arrow pointing down-left */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* ผลิตภัณฑ์/บริการ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            ผลิตภัณฑ์/บริการ <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleAddProduct}
            disabled={products.length >= 10}
            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
              products.length >= 10
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            เพิ่มรายการ
          </button>
        </div>

        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">รายการที่ {index + 1}</span>
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* ภาษาไทย */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ภาษาไทย <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`product-thai-${index}`}
                    value={product.thai || ''}
                    onChange={(e) => handleProductChange(index, 'thai', e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.products && errors.products[index] && errors.products[index].thai 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="กรุณาระบุ สินค้า/บริการ ครับ"
                  />
                  {errors.products && errors.products[index] && errors.products[index].thai && (
                    <div className="absolute top-0 right-0 -mt-1 -mr-1">
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-xs">
                        <div className="relative">
                          {errors.products[index].thai}
                          {/* Arrow pointing down-left */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ภาษาอังกฤษ */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ภาษาอังกฤษ
                  </label>
                  <input
                    type="text"
                    id={`product-english-${index}`}
                    value={product.english || ''}
                    onChange={(e) => handleProductChange(index, 'english', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Please specify your products/services"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.products && typeof errors.products === 'string' && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.products}</p>
          </div>
        )}
      </div>
    </div>
  );
}