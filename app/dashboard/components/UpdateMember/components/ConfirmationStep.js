import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaSave, FaTimes } from 'react-icons/fa';

const ConfirmationStep = ({ 
  formData, 
  originalData, 
  handleConfirmUpdate, 
  handleCancelUpdate, 
  submitting 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">ยืนยันการแก้ไขข้อมูล</h3>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
        <p className="text-sm text-blue-800 mb-2">
          คุณกำลังจะแก้ไขข้อมูลส่วนตัวของคุณ โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน
        </p>
        <p className="text-xs text-blue-600">
          หมายเหตุ: การแก้ไขข้อมูลจะต้องได้รับการอนุมัติจากผู้ดูแลระบบก่อน
        </p>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">ข้อมูลเดิม</h4>
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-900 font-medium">
                <span className="font-semibold">ชื่อ:</span> {originalData.firstName}
              </p>
              <p className="text-sm text-gray-900 font-medium">
                <span className="font-semibold">นามสกุล:</span> {originalData.lastName}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700">ข้อมูลใหม่</h4>
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-gray-900 font-medium">
                <span className="font-semibold">ชื่อ:</span> {formData.firstName}
              </p>
              <p className="text-sm text-gray-900 font-medium">
                <span className="font-semibold">นามสกุล:</span> {formData.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCancelUpdate}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
          disabled={submitting}
        >
          <FaTimes className="mr-2" /> ยกเลิก
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirmUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <FaSpinner />
              </motion.span>
              กำลังส่งข้อมูล...
            </span>
          ) : (
            <span className="flex items-center">
              <FaSave className="mr-2" /> ยืนยันการแก้ไข
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ConfirmationStep;
