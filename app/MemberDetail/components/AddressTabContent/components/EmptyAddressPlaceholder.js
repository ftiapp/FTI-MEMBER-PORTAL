'use client';

import { motion } from 'framer-motion';
import { FaMapMarkerAlt } from 'react-icons/fa';

/**
 * Empty address placeholder component
 */
export default function EmptyAddressPlaceholder() {
  return (
    <motion.div 
      className="py-16 text-center text-gray-500 bg-white rounded-lg shadow-inner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <FaMapMarkerAlt className="mx-auto h-16 w-16 text-gray-300 mb-4" />
      <p className="font-medium text-xl mb-2">ไม่พบข้อมูลที่อยู่</p>
      <p className="text-gray-400">กรุณาตรวจสอบรหัสที่อยู่หรือติดต่อผู้ดูแลระบบ</p>
    </motion.div>
  );
}