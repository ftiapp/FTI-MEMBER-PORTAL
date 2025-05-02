'use client';

import { motion } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

/**
 * ErrorState component displays an error message with retry button
 * @param {Object} props Component properties
 * @param {string} props.message The error message to display
 * @param {Function} props.onRetry Callback function when retry button is clicked
 * @returns {JSX.Element} The error state UI
 */
const ErrorState = ({ message, onRetry }) => (
  <motion.div 
    className="bg-white shadow rounded-lg p-6 mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-red-200 rounded-lg">
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <FaExclamationCircle className="text-red-500 mb-3" size={28} />
      </motion.div>
      <motion.p 
        className="font-medium mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
      </motion.p>
      <motion.button 
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        ลองใหม่อีกครั้ง
      </motion.button>
    </div>
  </motion.div>
);

export default ErrorState;