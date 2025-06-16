'use client';

import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

import ProductsList from './ProductsList';
import { formatProductsList } from './utils';
import { fetchMainCategories } from './api';
import LanguageToggle from './tsic/LanguageToggle';
import TsicCodeManager from './TsicCodeManager';

/**
 * Products tab content for the member detail page
 */
export default function ProductsTabContent({ companyInfo, memberType, memberGroupCode, typeCode }) {
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);
  const [language, setLanguage] = useState('th'); // 'th' หรือ 'en'
  const [mainCategories, setMainCategories] = useState([]);
  const productsList = formatProductsList(companyInfo.PRODUCT_DESC_TH);
  const memberCode = companyInfo.MEMBER_CODE || companyInfo.member_code;
  
  // โหลดข้อมูลหมวดหมู่ใหญ่เมื่อ component ถูกโหลด
  useEffect(() => {
    if (memberCode) {
      loadMainCategories();
    }
  }, [memberCode]);
  
  // รีเรนเดอร์เมื่อมีการเปลี่ยนภาษา
  useEffect(() => {
    // เมื่อมีการเปลี่ยนภาษา ให้บังคับให้ component รีเรนเดอร์
    console.log('Language changed to:', language);
  }, [language]);
  
  // ฟังก์ชันสำหรับโหลดข้อมูลหมวดหมู่ใหญ่
  const loadMainCategories = async () => {
    try {
      const result = await fetchMainCategories();
      if (result.success) {
        setMainCategories(result.data || []);
      } else {
        console.error('Error fetching main categories:', result.message);
      }
    } catch (error) {
      console.error('Error loading main categories:', error);
    }
  };
  
  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'th' ? 'en' : 'th');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* TSIC Code Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-900">รหัส TSIC</h2>
            <button
              type="button"
              onClick={() => setShowCategoryInfo(!showCategoryInfo)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              title="ข้อมูลหมวดหมู่"
            >
              <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">ภาษา:</span>
            <LanguageToggle 
              language={language} 
              onToggle={toggleLanguage} 
            />
          </div>
        </div>
        
        {/* ข้อมูลหมวดหมู่ใหญ่ */}
        {showCategoryInfo && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">หมวดหมู่ TSIC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainCategories.map(category => (
                <div key={category.id} className="p-3 bg-white rounded border border-gray-200">
                  <p className="font-medium text-gray-900">{category.category_code}</p>
                  <p className="text-sm text-gray-600">
                    {language === 'th' ? category.category_name : (category.category_name_EN || category.category_name)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    จำนวนรายการ: {category.item_count || 0}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              * สามารถเลือกได้สูงสุด 3 หมวดหมู่ใหญ่ และแต่ละหมวดหมู่สามารถเลือกได้สูงสุด 5 รายการ
            </p>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4">
          <TsicCodeManager 
            memberCode={memberCode} 
            language={language} 
            memberType={memberType}
            memberGroupCode={memberGroupCode}
            typeCode={typeCode}
          />
        </div>
      </section>

      {/* Products List Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {language === 'th' ? 'สินค้าและบริการ' : 'Products and Services'}
        </h2>
        <div className="border-t border-gray-200 pt-4">
          <ProductsList 
            companyInfo={companyInfo} 
            memberType={memberType}
            memberGroupCode={memberGroupCode}
            typeCode={typeCode}
            language={language}
          />
        </div>
      </section>

    </motion.div>
  );
}

// Set default props
ProductsTabContent.defaultProps = {
  companyInfo: {
    tsic_codes: []
  },
  memberType: '',
  memberGroupCode: '',
  typeCode: ''
};