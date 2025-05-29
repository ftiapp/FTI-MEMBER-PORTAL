import React from 'react';
import { motion } from 'framer-motion';
import { headingVariants } from '../utils/animationVariants';

const OperationsListHeader = () => {
  return (
    <>
      <motion.h3 
        variants={headingVariants} 
        className="text-xl font-semibold mb-1 text-blue-800"
      >
        สถานะการดำเนินการทั้งหมด
      </motion.h3>
      
      <motion.p 
        variants={headingVariants}
        className="text-gray-500 text-sm mb-4"
      >
        ตรวจสอบสถานะคำขอ คำร้อง หรือการดำเนินการต่าง ๆ ที่เกี่ยวข้องกับบัญชีและข้อมูลสมาชิกของคุณได้ที่นี่
      </motion.p>
    </>
  );
};

export default OperationsListHeader;
