'use client';

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import AutocompleteMultiSearch from './AutocompleteMultiSearch';
import TsicSearchDropdown from './TsicSearchDropdown';
import SelectedTsicList from './SelectedTsicList';
import { fetchAllCategories } from './api';

/**
 * Form component for adding/editing TSIC codes
 * Completely rebuilt to ensure proper category-TSIC association
 */
const TsicForm = ({ 
  editingTsic, 
  selectedCategory, 
  setSelectedCategory, 
  selectedTsicCodes, 
  setSelectedTsicCodes, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  error, 
  success,
  tsicCodes
}) => {
  // State for multiple categories
  const [selectedCategories, setSelectedCategories] = useState(selectedCategory ? [selectedCategory] : []);
  
  // State to track TSIC codes per category
  const [tsicCodesPerCategory, setTsicCodesPerCategory] = useState({});
  
  // State to track validation errors
  const [validationError, setValidationError] = useState(null);
  
  // Update parent component's selectedCategory when selectedCategories changes
  useEffect(() => {
    if (selectedCategories.length > 0) {
      setSelectedCategory(selectedCategories[selectedCategories.length - 1]);
    } else {
      setSelectedCategory(null);
    }
  }, [selectedCategories, setSelectedCategory]);
  
  // Update tsicCodesPerCategory when selectedTsicCodes changes
  useEffect(() => {
    // Group TSIC codes by category
    const groupedCodes = {};
    selectedTsicCodes.forEach(tsicCode => {
      const categoryCode = tsicCode.category_code;
      if (!groupedCodes[categoryCode]) {
        groupedCodes[categoryCode] = [];
      }
      groupedCodes[categoryCode].push(tsicCode);
    });
    setTsicCodesPerCategory(groupedCodes);
  }, [selectedTsicCodes]);
  
  // Check if a category has reached its limit of 5 TSIC codes
  const isCategoryFull = (categoryCode) => {
    if (!categoryCode) return false;
    return selectedTsicCodes.filter(item => item.category_code === categoryCode).length >= 5;
  };
  
  // Validate that each TSIC code belongs to its correct category
  const validateTsicCodes = () => {
    // Check if we have any TSIC codes
    if (selectedTsicCodes.length === 0) {
      setValidationError('กรุณาเลือกอย่างน้อย 1 TSIC code');
      return false;
    }
    
    // Check if all selected categories have at least one TSIC code
    const categoriesWithoutTsic = selectedCategories.filter(category => {
      return !selectedTsicCodes.some(tsic => tsic.category_code === category.category_code);
    });
    
    if (categoriesWithoutTsic.length > 0) {
      const categoryNames = categoriesWithoutTsic.map(cat => `${cat.category_code} - ${cat.category_name}`).join('\n- ');
      setValidationError(`กรุณาเลือกอย่างน้อย 1 TSIC code สำหรับแต่ละหมวดหมู่ที่เลือก:\n- ${categoryNames}`);
      return false;
    }
    
    // Clear any validation errors
    setValidationError(null);
    return true;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate TSIC codes before submission
    if (!validateTsicCodes()) {
      return;
    }
    
    // Submit the selected TSIC codes
    onSubmit(selectedTsicCodes);
  };
  
  // Check if we've reached the maximum of 3 categories
  const isMaxCategoriesReached = selectedCategories.length >= 3;
  return (
    <div className="border-t mt-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium">{editingTsic ? 'แก้ไขหมวดหมู่ธุรกิจ' : 'เพิ่มหมวดหมู่ธุรกิจ'}</h4>
        <button 
          className="text-gray-400 hover:text-gray-700"
          onClick={onCancel}
        >
          &times; ปิด
        </button>
      </div>
      
      {/* Error/Success messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {validationError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
          <FaExclamationTriangle className="mr-2 mt-1 flex-shrink-0" />
          <div>{validationError}</div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {/* Important Information Banner */}
      <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md">
        <div className="flex items-start">
          <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium">สำคัญ: ระบบจะตรวจสอบความถูกต้องของรหัส TSIC กับหมวดหมู่</p>
            <p className="text-sm mt-1">แต่ละรหัส TSIC จะถูกบันทึกพร้อมกับหมวดหมู่ที่ถูกต้องตามฐานข้อมูลของระบบ</p>
          </div>
        </div>
      </div>
      
      {/* Category Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          ท่านสามารถเลือกหมวดหมู่ของธุรกิจท่านได้มากที่สุด 3 หมวดหมู่ จากนั้นท่านจึงจะสามารถเลือก หมวดหมู่ TSIC ของท่านได้
        </label>
        <AutocompleteMultiSearch
          placeholder="เลือกหมวดหมู่..."
          fetchSuggestions={fetchAllCategories}
          value={selectedCategories}
          onChange={setSelectedCategories}
          getOptionLabel={opt => opt ? `${opt.category_code} - ${opt.category_name}` : ''}
          disabled={isMaxCategoriesReached}
          maxSelections={3}
        />
        {isMaxCategoriesReached && (
          <p className="text-yellow-600 text-xs mt-1">
            คุณได้เลือกจำนวนหมวดหมู่สูงสุดที่อนุญาตแล้ว (3 หมวดหมู่)
          </p>
        )}
      </div>

      {/* Category and TSIC Code Selection */}
      {selectedCategories.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <h3 className="text-lg font-medium text-blue-600 mb-4">เลือกหมวดย่อยของแต่ละหมวดหมู่</h3>
          
          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
            <p className="text-sm text-blue-700">
              <strong>คำแนะนำ:</strong> กรุณาเลือกหมวดย่อยอย่างน้อย 1 รายการสำหรับแต่ละหมวดหมู่ใหญ่ที่ท่านเลือก (สูงสุด 5 รายการต่อหมวดหมู่)
            </p>
          </div>
          
          {/* Categories and their TSIC codes */}
          <div className="space-y-6">
            {selectedCategories.map((category, index) => {
              // Count how many TSIC codes are selected for this category
              const selectedCount = selectedTsicCodes.filter(tsic => 
                tsic.category_code === category.category_code
              ).length;
              
              // Check if this category has reached its limit
              const isFull = selectedCount >= 5;
              
              return (
                <div key={index} className="border rounded-lg overflow-hidden">
                  {/* Category header */}
                  <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                    <h4 className="font-medium">
                      {category.category_code} - {category.category_name}
                    </h4>
                    <span className={`text-sm px-2 py-1 rounded ${selectedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {selectedCount > 0 ? `เลือกแล้ว ${selectedCount}/5` : 'ยังไม่ได้เลือก'}
                    </span>
                  </div>
                  
                  {/* TSIC code selection */}
                  <div className="p-3">
                    <label className="block text-sm font-medium mb-1">ค้นหารายละเอียด TSIC ของหมวดหมู่นี้</label>
                    <TsicSearchDropdown 
                      placeholder="คลิกเพื่อดูรายการ TSIC CODE..."
                      categoryCode={category.category_code}
                      fetchSuggestions={async (query) => {
                        try {
                          // เรียกใช้ API โดยตรงเพื่อให้แน่ใจว่าได้ข้อมูลทั้งหมด
                          const url = `/api/tsic-codes?category_code=${category.category_code}&limit=9999`;
                          const response = await fetch(url);
                          if (!response.ok) throw new Error('Failed to fetch TSIC codes');
                          const data = await response.json();
                          
                          // แปลงข้อมูลให้อยู่ในรูปแบบที่ถูกต้อง
                          let results = [];
                          if (data.results && Array.isArray(data.results)) {
                            results = data.results;
                          } else if (Array.isArray(data)) {
                            results = data;
                          }
                          
                          // ดึงข้อมูล category_order จากฐานข้อมูล
                          const categoryResponse = await fetch(`/api/tsic-categories?category_code=${category.category_code}`);
                          let categoryOrder = category.category_code; // ค่าเริ่มต้น
                          
                          if (categoryResponse.ok) {
                            const categoryData = await categoryResponse.json();
                            if (categoryData && categoryData.length > 0) {
                              categoryOrder = categoryData[0].category_order || category.category_code;
                            }
                          }
                          
                          // Add category information to each result
                          results = results.map(item => ({
                            ...item,
                            category_code: category.category_code,
                            category_name: category.category_name,
                            category_order: categoryOrder // เพิ่ม category_order
                          }));
                          
                          // กรองข้อมูลตามคำค้นหา (ถ้ามี)
                          if (query && query.length > 0) {
                            const lowercaseQuery = query.toLowerCase();
                            results = results.filter(item => {
                              const code = item.tsic_code || item.code || '';
                              const description = item.tsic_description || item.description || item.name || '';
                              
                              return code.toLowerCase().includes(lowercaseQuery) || 
                                     description.toLowerCase().includes(lowercaseQuery);
                            });
                          }
                          
                          // เรียงลำดับตาม TSIC code
                          results.sort((a, b) => {
                            const codeA = a.tsic_code || a.code || '';
                            const codeB = b.tsic_code || b.code || '';
                            return codeA.localeCompare(codeB);
                          });
                          
                          return results;
                        } catch (error) {
                          console.error('Error fetching TSIC codes:', error);
                          return [];
                        }
                      }}
                      onSelect={(tsic) => {
                        if (!tsic) return;
                        
                        // Ensure the TSIC code has the correct category information
                        const tsicWithCategory = {
                          ...tsic,
                          category_code: category.category_code,
                          category_name: category.category_name,
                          category_order: tsic.category_order || category.category_code // ใช้ค่า category_order ที่ดึงมาจาก API
                        };
                        
                        // Check if this TSIC code is already selected
                        if (selectedTsicCodes.some(item => item.tsic_code === tsicWithCategory.tsic_code)) {
                          return;
                        }
                        
                        // Check if we've reached the limit for this category
                        if (selectedCount >= 5) {
                          setValidationError(`คุณได้เลือก TSIC code สำหรับหมวดหมู่นี้ครบ 5 รายการแล้ว`);
                          return;
                        }
                        
                        // Add the TSIC code and clear any validation errors
                        setSelectedTsicCodes([...selectedTsicCodes, tsicWithCategory]);
                        setValidationError(null);
                      }}
                      disabled={isFull}
                    />
                    
                    {/* Selected TSIC codes for this category */}
                    {selectedTsicCodes.filter(tsic => tsic.category_code === category.category_code).length > 0 && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-sm font-medium mb-1">รายการที่เลือกในหมวดหมู่นี้:</p>
                        <ul className="text-sm space-y-1">
                          {selectedTsicCodes
                            .filter(tsic => tsic.category_code === category.category_code)
                            .map((tsic, idx) => (
                              <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span>
                                  <span className="font-medium">{tsic.tsic_code}</span> - {tsic.tsic_description || tsic.description}
                                </span>
                                <button 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    const newTsicCodes = selectedTsicCodes.filter(item => 
                                      item.tsic_code !== tsic.tsic_code
                                    );
                                    setSelectedTsicCodes(newTsicCodes);
                                  }}
                                >
                                  <FaTimes />
                                </button>
                              </li>
                            ))
                          }
                        </ul>
                      </div>
                    )}
                    
                    {isFull && (
                      <p className="text-yellow-600 text-xs mt-1">
                        คุณได้เลือก TSIC code สำหรับหมวดหมู่นี้ครบ 5 รายการแล้ว
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected TSIC Codes Summary */}
      {selectedTsicCodes.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-medium text-blue-600 mb-2">สรุปรายการ TSIC ที่เลือกทั้งหมด</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">หมวดหมู่</th>
                  <th className="text-left pb-2">รหัส TSIC</th>
                  <th className="text-left pb-2">คำอธิบาย</th>
                </tr>
              </thead>
              <tbody>
                {selectedTsicCodes.map((tsic, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{tsic.category_code}</td>
                    <td className="py-2 font-medium">{tsic.tsic_code}</td>
                    <td className="py-2">{tsic.tsic_description || tsic.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 mt-6">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onCancel}
        >
          ยกเลิก
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          disabled={selectedCategories.length === 0 || selectedTsicCodes.length === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting && <FaSpinner className="animate-spin mr-2" />}
          ยืนยันข้อมูล
        </button>
      </div>
    </div>
  );
};

export default TsicForm;