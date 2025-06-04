'use client';

import { motion } from 'framer-motion';
import { FaDesktop, FaEdit, FaMapMarkerAlt, FaCode, FaShoppingCart, FaShareAlt, FaImage, FaFileAlt, FaMousePointer } from 'react-icons/fa';

/**
 * InfoBox component displays information about editable content
 * @returns {JSX.Element} The InfoBox UI
 */
const InfoBox = () => {
  return (
    <motion.div 
      className="mb-4 p-3 sm:p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <FaDesktop className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
        </div>
        <div className="ml-2 sm:ml-3 w-full">
          <h3 className="text-xs sm:text-sm font-medium text-blue-800 mb-1 sm:mb-0">การใช้งานระบบ</h3>
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <div className="flex items-center mb-1 sm:mb-0">
                <FaMousePointer className="inline mr-1 sm:mr-2 text-blue-600 flex-shrink-0" size={10} />
                <span className="text-xs sm:text-sm">เลือกแถวข้อมูลเพื่อตรวจสอบรายละเอียด</span>
              </div>
              <span className="hidden sm:inline mx-2">|</span>
              <div className="flex items-center mb-1 sm:mb-0">
                <FaFileAlt className="inline mr-1 sm:mr-2 text-blue-600 flex-shrink-0" size={10} />
                <span className="text-xs sm:text-sm">กด "ดูเอกสาร" เพื่อตรวจสอบเอกสารยืนยัน</span>
              </div>
              <span className="hidden sm:inline mx-2">|</span>
              <div className="flex items-center">
                <FaEdit className="inline mr-1 sm:mr-2 text-blue-600 flex-shrink-0" size={10} />
                <span className="text-xs sm:text-sm">กด "แก้ไขข้อมูล" เพื่อปรับปรุงข้อมูล</span>
              </div>
            </div>
            
            <div className="pt-1 sm:pt-0">
              <div className="text-xs leading-relaxed">
                <span className="font-medium">หมวดที่แก้ไขได้:</span>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="inline mr-1 text-blue-600 flex-shrink-0" size={9} />
                    <span>ที่อยู่</span>
                  </div>
                  <div className="flex items-center">
                    <FaCode className="inline mr-1 text-blue-600 flex-shrink-0" size={9} />
                    <span>TSIC CODE</span>
                  </div>
                  <div className="flex items-center">
                    <FaShoppingCart className="inline mr-1 text-blue-600 flex-shrink-0" size={9} />
                    <span>สินค้า/บริการ</span>
                  </div>
                  <div className="flex items-center">
                    <FaShareAlt className="inline mr-1 text-blue-600 flex-shrink-0" size={9} />
                    <span>โซเชียลมีเดีย</span>
                  </div>
                  <div className="flex items-center">
                    <FaImage className="inline mr-1 text-blue-600 flex-shrink-0" size={9} />
                    <span>โลโก้</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InfoBox;