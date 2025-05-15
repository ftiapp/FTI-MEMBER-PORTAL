'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export default function TsicUpdatesHeader({ filter, setFilter, actionSuccess, actionError }) {
  // Default props to prevent errors
  const handleFilterChange = setFilter || (() => console.warn('setFilter prop is not provided'));
  const currentFilter = filter || 'pending';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold mb-4">จัดการคำขอแก้ไข TSIC</h1>
      
      {actionSuccess && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
        >
          <div className="flex items-center">
            <FaCheck className="mr-2" />
            <span>{actionSuccess}</span>
          </div>
        </motion.div>
      )}
      
      {actionError && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        >
          <div className="flex items-center">
            <FaTimes className="mr-2" />
            <span>{actionError}</span>
          </div>
        </motion.div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-md ${currentFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => handleFilterChange('pending')}
        >
          รอการอนุมัติ
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-md ${currentFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => handleFilterChange('approved')}
        >
          อนุมัติแล้ว
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-md ${currentFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => handleFilterChange('rejected')}
        >
          ปฏิเสธแล้ว
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-md ${currentFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => handleFilterChange('all')}
        >
          ทั้งหมด
        </motion.button>
      </div>
    </motion.div>
  );
}
