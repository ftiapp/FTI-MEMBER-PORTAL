'use client';

import { motion } from 'framer-motion';
import { FaInfoCircle } from 'react-icons/fa';

/**
 * Empty state component for the member detail page
 */
export default function EmptyState() {
  return (
    <motion.div 
      className="bg-white shadow rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="py-16 flex flex-col items-center justify-center text-gray-600">
        <motion.div 
          className="mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <FaInfoCircle className="w-16 h-16 text-blue-500" />
        </motion.div>
        <motion.p 
          className="font-medium text-lg mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ไม่พบข้อมูลสมาชิก
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ไม่พบข้อมูลสมาชิกสำหรับรหัสสมาชิกที่ระบุ
        </motion.p>
      </div>
    </motion.div>
  );
}