import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaClock } from 'react-icons/fa';

const FinalStep = () => {
  // Animation variants for check icon
  const checkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15,
        delay: 0.2 
      } 
    }
  };
  
  // Animation for the success text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.4, duration: 0.5 } 
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6"
    >
      <div className="flex items-center justify-center mb-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={checkVariants}
          className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center"
        >
          <FaCheckCircle className="text-green-600 text-3xl" />
        </motion.div>
      </div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={textVariants}
      >
        <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">ส่งคำขอแก้ไขข้อมูลสำเร็จ</h3>
        <p className="mb-4 text-gray-900 font-medium text-center">คำขอแก้ไขข้อมูลของคุณได้ถูกส่งไปยังผู้ดูแลระบบเรียบร้อยแล้ว</p>
        
        <div className="flex items-center justify-center text-gray-800 bg-green-100 p-3 rounded-lg">
          <FaClock className="mr-2 text-green-600" />
          <p className="text-sm font-medium">ผู้ดูแลระบบจะดำเนินการตรวจสอบและอนุมัติคำขอภายใน 2 วันทำการ</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FinalStep;
