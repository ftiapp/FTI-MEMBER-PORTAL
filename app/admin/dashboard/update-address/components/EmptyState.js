'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaInbox } from 'react-icons/fa';

/**
 * EmptyState component displays a message when no data is available
 * @param {string} message - Optional custom empty state message
 */
const EmptyState = ({ message = 'ไม่พบข้อมูล' }) => (
  <motion.div 
    className="flex flex-col items-center justify-center py-12 px-4 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="bg-gray-100 rounded-full p-6 mb-4">
      <FaInbox className="text-gray-400 text-4xl" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบรายการ</h3>
    <p className="text-gray-500 max-w-md">
      {message}
    </p>
  </motion.div>
);

export default EmptyState;
