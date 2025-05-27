'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchTsicCodes, deleteTsicCode } from '../api';
import { useAuth } from '@/app/contexts/AuthContext';

export default function TsicManagement({ memberCode, onAdd, language = 'th' }) {
  const { user } = useAuth();
  const [tsicData, setTsicData] = useState([]);
  const [groupedTsicData, setGroupedTsicData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCategoryDeleteConfirm, setShowCategoryDeleteConfirm] = useState(null);
  const [totalTsicCount, setTotalTsicCount] = useState(0);

  // Helper function to get text based on current language
  const getText = (thText, enText) => {
    return language === 'th' ? thText : (enText || thText);
  };

  // Fetch TSIC codes on component mount
  useEffect(() => {
    if (memberCode) {
      loadTsicCodes();
    }
  }, [memberCode]);

  // Load TSIC codes from API
  const loadTsicCodes = async () => {
    setIsLoading(true);
    try {
      const result = await fetchTsicCodes(memberCode);
      
      if (result.success && Array.isArray(result.data)) {
        setTsicData(result.data);
        
        // Group TSIC codes by category
        const grouped = {};
        let count = 0;
        
        result.data.forEach(tsic => {
          if (!grouped[tsic.category_code]) {
            grouped[tsic.category_code] = [];
          }
          grouped[tsic.category_code].push(tsic);
          count++;
        });
        
        setGroupedTsicData(grouped);
        setTotalTsicCount(count);
      } else {
        toast.error(getText(
          'ไม่สามารถโหลดรหัส TSIC ได้',
          'Unable to load TSIC codes'
        ));
      }
    } catch (error) {
      console.error('Error loading TSIC codes:', error);
      toast.error(getText(
        'เกิดข้อผิดพลาดในการโหลดรหัส TSIC',
        'Error loading TSIC codes'
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete TSIC code
  const handleDelete = async (tsicCode) => {
    if (!user) {
      toast.error(getText(
        'กรุณาเข้าสู่ระบบก่อนดำเนินการ',
        'Please log in before proceeding'
      ));
      return;
    }
    
    setIsDeleting(true);
    try {
      const result = await deleteTsicCode(memberCode, tsicCode);
      
      if (result.success) {
        toast.success(getText(
          'ลบรหัส TSIC เรียบร้อยแล้ว',
          'TSIC code deleted successfully'
        ));
        
        // Reload TSIC codes
        await loadTsicCodes();
      } else {
        toast.error(result.message || getText(
          'ไม่สามารถลบรหัส TSIC ได้',
          'Unable to delete TSIC code'
        ));
      }
    } catch (error) {
      console.error('Error deleting TSIC code:', error);
      toast.error(getText(
        'เกิดข้อผิดพลาดในการลบรหัส TSIC',
        'Error deleting TSIC code'
      ));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  // Handle delete all TSIC codes in a category
  const handleDeleteCategory = async (categoryCode) => {
    if (!user) {
      toast.error(getText(
        'กรุณาเข้าสู่ระบบก่อนดำเนินการ',
        'Please log in before proceeding'
      ));
      return;
    }
    
    setIsDeleting(true);
    try {
      // Get all TSIC codes in this category
      const tsicCodesToDelete = groupedTsicData[categoryCode].map(tsic => tsic.tsic_code);
      
      // Delete each TSIC code
      let allSuccess = true;
      for (const tsicCode of tsicCodesToDelete) {
        const result = await deleteTsicCode(memberCode, tsicCode);
        if (!result.success) {
          allSuccess = false;
          toast.error(result.message || getText(
            `ไม่สามารถลบรหัส TSIC ${tsicCode} ได้`,
            `Unable to delete TSIC code ${tsicCode}`
          ));
        }
      }
      
      if (allSuccess) {
        toast.success(getText(
          `ลบรหัส TSIC ในหมวดหมู่ ${categoryCode} เรียบร้อยแล้ว`,
          `All TSIC codes in category ${categoryCode} deleted successfully`
        ));
      }
      
      // Reload TSIC codes
      await loadTsicCodes();
    } catch (error) {
      console.error('Error deleting TSIC category:', error);
      toast.error(getText(
        'เกิดข้อผิดพลาดในการลบรหัส TSIC',
        'Error deleting TSIC codes'
      ));
    } finally {
      setIsDeleting(false);
      setShowCategoryDeleteConfirm(null);
    }
  };

  // Get category name
  const getCategoryName = (categoryCode) => {
    if (!groupedTsicData[categoryCode] || groupedTsicData[categoryCode].length === 0) {
      return categoryCode;
    }
    
    const firstTsic = groupedTsicData[categoryCode][0];
    return language === 'th' 
      ? firstTsic.category_name || categoryCode
      : firstTsic.category_name_EN || firstTsic.category_name || categoryCode;
  };

  // Check if we've reached the maximum number of categories/subcategories
  const canAddMore = () => {
    const categoryCount = Object.keys(groupedTsicData).length;
    return categoryCount < 3 || totalTsicCount < 15;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-blue-600">
          {getText('รหัส TSIC ที่มีอยู่', 'Existing TSIC Codes')}
        </h3>
        {canAddMore() && (
          <button
            type="button"
            onClick={onAdd}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {getText('เพิ่มรหัส/แก้ไขรหัส', 'Add/Edit Code')}
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : Object.keys(groupedTsicData).length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {getText('ไม่พบรหัส TSIC', 'No TSIC codes found')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedTsicData).map(categoryCode => (
            <div key={categoryCode} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-gray-800 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                    {categoryCode}
                  </span>
                  {getCategoryName(categoryCode)}
                  <span className="ml-2 text-sm bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                    {groupedTsicData[categoryCode].length}/{5}
                  </span>
                </h4>
              </div>
              
              <div className="space-y-2">
                {groupedTsicData[categoryCode].map(tsic => (
                  <div key={tsic.tsic_code} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">{tsic.tsic_code}</span>
                        <span className="text-sm text-gray-600">
                          {language === 'th' ? tsic.description : (tsic.description_EN || tsic.description)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(tsic.tsic_code)}
                        className="text-gray-500 hover:text-red-600 transition-colors duration-200 p-1"
                        disabled={isDeleting}
                        title={getText('ลบ', 'Delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] m-0 p-0 top-0 left-0 right-0 bottom-0 w-screen h-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {getText('ยืนยันการลบ', 'Confirm Deletion')}
            </h3>
            <p className="text-gray-600 mb-6">
              {getText(
                `คุณต้องการลบรหัส TSIC ${showDeleteConfirm} ใช่หรือไม่?`,
                `Are you sure you want to delete TSIC code ${showDeleteConfirm}?`
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isDeleting}
              >
                {getText('ยกเลิก', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {getText('กำลังลบ...', 'Deleting...')}
                  </span>
                ) : (
                  getText('ลบ', 'Delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete category confirmation modal */}
      {showCategoryDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] m-0 p-0 top-0 left-0 right-0 bottom-0 w-screen h-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {getText('ยืนยันการลบทั้งหมด', 'Confirm Delete All')}
            </h3>
            <p className="text-gray-600 mb-6">
              {getText(
                `คุณต้องการลบรหัส TSIC ทั้งหมดในหมวดหมู่ ${showCategoryDeleteConfirm} ใช่หรือไม่?`,
                `Are you sure you want to delete all TSIC codes in category ${showCategoryDeleteConfirm}?`
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCategoryDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={isDeleting}
              >
                {getText('ยกเลิก', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(showCategoryDeleteConfirm)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {getText('กำลังลบ...', 'Deleting...')}
                  </span>
                ) : (
                  getText('ลบทั้งหมด', 'Delete All')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
