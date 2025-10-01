import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center max-w-md w-full mx-4"
      >
        <div className="w-16 h-16 mb-4">
          <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">กำลังดำเนินการ</h3>
        <p className="text-gray-600 text-center">กรุณารอสักครู่ ระบบกำลังประมวลผลข้อมูลการลงทะเบียนของท่าน</p>
      </motion.div>
    </div>
  );
};

export default LoadingOverlay;
