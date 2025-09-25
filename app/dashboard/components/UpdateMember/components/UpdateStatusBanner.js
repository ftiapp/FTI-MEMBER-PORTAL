import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const UpdateStatusBanner = ({ status, requestsToday, maxRequests, limitLoading }) => {
  if (status === 'pending') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FaExclamationCircle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">คำขอแก้ไขข้อมูลของคุณกำลังรอการอนุมัติ</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>ผู้ดูแลระบบกำลังตรวจสอบคำขอแก้ไขข้อมูลของคุณ กรุณารอการตรวจสอบ</p>
            </div>
            <div className="mt-2">
              {limitLoading ? (
                <div className="flex items-center text-sm text-yellow-600">
                  <FaSpinner className="animate-spin mr-1" /> กำลังตรวจสอบจำนวนคำขอ...
                </div>
              ) : (
                <p className="text-sm text-yellow-600">
                  คุณได้ส่งคำขอแก้ไขข้อมูล {requestsToday}/{maxRequests} ครั้งในวันนี้
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  } else if (status === 'rejected') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FaExclamationCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">คำขอแก้ไขข้อมูลของคุณถูกปฏิเสธ</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>ผู้ดูแลระบบได้ปฏิเสธคำขอแก้ไขข้อมูลของคุณ คุณสามารถส่งคำขอใหม่ได้</p>
            </div>
            <div className="mt-2">
              {limitLoading ? (
                <div className="flex items-center text-sm text-red-600">
                  <FaSpinner className="animate-spin mr-1" /> กำลังตรวจสอบจำนวนคำขอ...
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  คุณได้ส่งคำขอแก้ไขข้อมูล {requestsToday}/{maxRequests} ครั้งในวันนี้
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  } else if (status === 'approved') {
    // Do not display any banner when approved
    return null;
  }
  
  return null;
};

export default UpdateStatusBanner;
