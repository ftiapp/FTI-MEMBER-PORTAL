'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEdit, FaFileAlt } from 'react-icons/fa';

const CompanyList = ({ 
  companies, 
  onRemove, 
  onEdit, 
  maxCompanies = 10,
  onAddMore,
  isAddingMore
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">บริษัทที่เลือก ({companies.length}/{maxCompanies})</h3>
      
      <AnimatePresence>
        {companies.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500"
          >
            ยังไม่มีบริษัทที่เลือก กรุณาเลือกบริษัทที่ต้องการยืนยันตัวตน
          </motion.div>
        )}
        
        {companies.length > 0 && (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {companies.map((company, index) => (
              <motion.div 
                key={company.id || index}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-medium text-gray-900">{company.memberNumber}</span>
                    <span className="text-sm text-gray-500">({company.memberType})</span>
                  </div>
                  <h4 className="text-md font-medium text-gray-800">{company.companyName}</h4>
                  <p className="text-sm text-gray-600">เลขประจำตัวผู้เสียภาษี: {company.taxId}</p>
                  
                  {company.documentFile && (
                    <div className="mt-2 flex items-center text-sm text-blue-600">
                      <FaFileAlt className="mr-1" />
                      <span className="truncate max-w-[200px]">
                        {typeof company.documentFile === 'string' 
                          ? company.documentFile 
                          : company.documentFile.name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 w-full sm:w-auto justify-end">
                  <motion.button
                    type="button"
                    onClick={() => onEdit(index)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEdit className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrash className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {companies.length < maxCompanies && (
        <motion.button
          type="button"
          onClick={onAddMore}
          disabled={isAddingMore}
          className={`mt-4 w-full py-2 px-4 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isAddingMore ? 'opacity-70 cursor-not-allowed' : ''}`}
          whileHover={{ scale: isAddingMore ? 1 : 1.01 }}
          whileTap={{ scale: isAddingMore ? 1 : 0.99 }}
        >
          {isAddingMore ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังเพิ่มบริษัท...
            </div>
          ) : '+ เพิ่มบริษัท'}
        </motion.button>
      )}
    </div>
  );
};

export default CompanyList;
