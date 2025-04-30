'use client';

import { motion } from 'framer-motion';
import { FaTimesCircle } from 'react-icons/fa';

/**
 * Error state component for the member detail page
 */
export default function ErrorState({ error }) {
  return (
    <motion.div 
      className="bg-white shadow rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="py-16 flex flex-col items-center justify-center text-red-600">
        <motion.div 
          className="mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <FaTimesCircle className="w-16 h-16" />
        </motion.div>
        <motion.p 
          className="font-medium text-lg mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          เกิดข้อผิดพลาด
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error}
        </motion.p>
        <motion.button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          ลองใหม่
        </motion.button>
      </div>
    </motion.div>
  );
}