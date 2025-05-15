'use client';

import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';

import TsicFlow from './TsicFlow';
import TsicCodesList from './TsicCodesList';
import TsicForm from './TsicForm';
import ProductsList from './ProductsList';
import { formatProductsList } from './utils';
import { fetchTsicCodes, submitTsicUpdate } from './api';

/**
 * Products tab content for the member detail page
 */
export default function ProductsTabContent({ companyInfo }) {
  // TSIC Code state
  const [tsicCodes, setTsicCodes] = useState([]);
  const [showTsicModal, setShowTsicModal] = useState(false);
  const [editingTsic, setEditingTsic] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTsicCodes, setSelectedTsicCodes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [memberCode, setMemberCode] = useState(null);
  const [userId, setUserId] = useState(null);
  const [flowStep, setFlowStep] = useState(1);
  
  const productsList = formatProductsList(companyInfo.PRODUCT_DESC_TH);
  
  // Get member code and user ID from companyInfo
  useEffect(() => {
    if (companyInfo && companyInfo.MEMBER_CODE) {
      setMemberCode(companyInfo.MEMBER_CODE);
    } else {
      // Fallback for demo
      setMemberCode('DEMO123');
    }
    setUserId(1); // Placeholder user ID, should come from authentication context
  }, [companyInfo]);
  
  // Fetch existing TSIC codes when member code changes
  useEffect(() => {
    async function loadTsicCodes() {
      if (!memberCode) return;
      
      try {
        const allCodes = await fetchTsicCodes(memberCode);
        setTsicCodes(allCodes);
      } catch (error) {
        console.error('Error fetching TSIC codes:', error);
      }
    }
    
    loadTsicCodes();
  }, [memberCode]);

  // Update flow step based on selection
  useEffect(() => {
    if (showTsicModal) {
      if (!selectedCategory) {
        setFlowStep(1);
      } else if (selectedCategory && selectedTsicCodes.length === 0) {
        setFlowStep(2);
      } else if (selectedTsicCodes.length > 0) {
        setFlowStep(3);
      }
    }
  }, [selectedCategory, selectedTsicCodes, showTsicModal]);

  // Submit TSIC codes to backend
  const handleSubmitTsic = async () => {
    if (!selectedCategory || selectedTsicCodes.length === 0 || !memberCode || !userId) {
      setError('ข้อมูลไม่ครบถ้วน กรุณาลองใหม่อีกครั้ง');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare data for submission
      const tsicCodesWithCategory = selectedTsicCodes.map(tsic => ({
        category_code: selectedCategory.category_code,
        category_name: selectedCategory.category_name,
        category_order: tsic.category_order,
        tsic_code: tsic.tsic_code,
        description: tsic.description
      }));
      
      const result = await submitTsicUpdate(userId, memberCode, tsicCodesWithCategory);
      
      if (result.success) {
        setSuccess(result.message);
        // Update the local state to show pending status
        const updatedCodes = tsicCodesWithCategory.map(code => ({
          ...code,
          status: 'pending'
        }));
        setTsicCodes(updatedCodes);
        setFlowStep(4); // Move to last step
        
        // Close modal after a delay
        setTimeout(() => {
          setShowTsicModal(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
      }
    } catch (error) {
      console.error('Error submitting TSIC update:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal is opened
  useEffect(() => {
    if (showTsicModal) {
      setSelectedCategory(null);
      setSelectedTsicCodes([]);
      setError(null);
      setSuccess(null);
      setFlowStep(1);
      
      // If editing, pre-populate with existing data
      if (editingTsic && tsicCodes.length > 0) {
        // Group by category
        const categories = {};
        tsicCodes.forEach(code => {
          if (!categories[code.category_code]) {
            categories[code.category_code] = {
              category_code: code.category_code,
              category_name: code.category_name,
              codes: []
            };
          }
          categories[code.category_code].codes.push(code);
        });
        
        // Use the first category
        const firstCategory = Object.values(categories)[0];
        if (firstCategory) {
          setSelectedCategory({
            category_code: firstCategory.category_code,
            category_name: firstCategory.category_name
          });
          setSelectedTsicCodes(firstCategory.codes);
          setFlowStep(3); // Set appropriate flow step for editing
        }
      }
    }
  }, [showTsicModal, editingTsic, tsicCodes]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* TSIC โค้ด Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-medium text-blue-600 border-b pb-2">
          TSIC โค้ด
        </h3>
        
        {/* Error/Success messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* TSIC Flow Steps */}
        {showTsicModal && (
          <TsicFlow flowStep={flowStep} />
        )}
        
        {/* TSIC Codes List */}
        {tsicCodes.length === 0 && !showTsicModal ? (
          <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            ยังไม่มีข้อมูล หมวดหมู่ธุรกิจของท่าน กรุณา "เพิ่มข้อมูล"<br />
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => setShowTsicModal(true)}
            >
              เพิ่มข้อมูล
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mt-4">
            {!showTsicModal && (
              <TsicCodesList 
                tsicCodes={tsicCodes} 
                onEdit={() => {
                  setEditingTsic(true);
                  setShowTsicModal(true);
                }} 
              />
            )}
            
            {/* Add/Edit TSIC Form */}
            {showTsicModal && (
              <TsicForm
                editingTsic={editingTsic}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTsicCodes={selectedTsicCodes}
                setSelectedTsicCodes={setSelectedTsicCodes}
                onSubmit={handleSubmitTsic}
                onCancel={() => setShowTsicModal(false)}
                isSubmitting={isSubmitting}
                error={error}
                success={success}
                tsicCodes={tsicCodes}
              />
            )}
          </div>
        )}
      </motion.div>
      
      {/* Products and Services Section */}
      <ProductsList companyInfo={companyInfo} />
    </motion.div>
  );
}

// Set default props
ProductsTabContent.defaultProps = {
  companyInfo: {},
};