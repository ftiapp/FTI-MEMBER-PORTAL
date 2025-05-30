'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ReviewStep = ({ 
  companies, 
  onSubmit, 
  onBack, 
  isSubmitting 
}) => {
  return (
    <motion.div 
      className="bg-white shadow-md rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">ตรวจสอบข้อมูลและเอกสารทั้งหมด</h3>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700">
          กรุณาตรวจสอบข้อมูลและเอกสารทั้งหมดให้ถูกต้องก่อนส่งข้อมูล เจ้าหน้าที่จะดำเนินการตรวจสอบข้อมูลของท่านภายในระยะเวลา 2 วันทำการ
        </p>
      </div>
      
      <div className="space-y-6">
        {companies.map((company, index) => (
          <motion.div 
            key={company.id || index}
            className="border border-gray-200 rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium text-gray-900">{company.memberNumber}</span>
                <span className="text-sm text-gray-500">({company.memberType})</span>
              </div>
              <h4 className="text-md font-medium text-gray-800">{company.companyName}</h4>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">เลขประจำตัวผู้เสียภาษี</p>
                  <p className="text-md text-gray-900">{company.taxId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">เอกสารแนบ</p>
                  {company.documentFile ? (
                    <div className="flex items-center text-sm text-blue-600">
                      <FaFileAlt className="mr-2" />
                      <span className="truncate max-w-[250px]">
                        {typeof company.documentFile === 'string' 
                          ? company.documentFile 
                          : company.documentFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-red-600">
                      <FaTimesCircle className="mr-2" />
                      <span>ไม่มีเอกสารแนบ</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <div className={`flex items-center ${company.documentFile ? 'text-green-600' : 'text-red-600'}`}>
                  {company.documentFile ? (
                    <>
                      <FaCheckCircle className="mr-2" />
                      <span className="text-sm">พร้อมส่งข้อมูล</span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="mr-2" />
                      <span className="text-sm">กรุณาแนบเอกสาร</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
        <motion.button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="py-2.5 px-5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ย้อนกลับ
        </motion.button>
        
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || companies.some(company => !company.documentFile)}
          className={`py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting || companies.some(company => !company.documentFile) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังส่งข้อมูล...
            </div>
          ) : 'ส่งข้อมูลทั้งหมด'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReviewStep;
