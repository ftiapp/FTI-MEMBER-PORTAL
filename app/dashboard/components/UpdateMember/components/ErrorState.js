import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

const ErrorState = ({ onRetry }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow rounded-lg p-6 mb-6"
    >
      <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-red-200 rounded-lg">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FaExclamationCircle className="text-red-500 mb-3" size={28} />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-medium mb-3"
        >
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </motion.p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          ลองใหม่อีกครั้ง
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ErrorState;
