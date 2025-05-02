'use client';

import { motion } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

/**
 * EmptyState component displays a message when no data is available
 * @returns {JSX.Element} The empty state UI
 */
const EmptyState = () => (
  <motion.div 
    className="bg-white shadow rounded-lg p-6 mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="py-16 flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-gray-200 rounded-lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <FaExclamationCircle className="text-gray-400 mb-3" size={28} />
      </motion.div>
      <motion.p 
        className="font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        ไม่พบข้อมูลบริษัทที่ได้รับการอนุมัติ
      </motion.p>
    </div>
  </motion.div>
);

export default EmptyState;