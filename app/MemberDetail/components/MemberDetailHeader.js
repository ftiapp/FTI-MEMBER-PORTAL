'use client';

import { motion } from 'framer-motion';
import { FaBuilding, FaIdCard, FaUser, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

/**
 * Header component for the member detail page
 * Displays company name, type, member code, and status
 */
export default function MemberDetailHeader({ companyInfo, memberTypeInfo, statusInfo, getOrganizationType, itemVariants }) {
  return (
    <motion.div 
      className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6"
      variants={itemVariants}
    >
      <motion.h2 
        className="text-2xl font-bold mb-2"
        variants={itemVariants}
      >
        {companyInfo.COMPANY_NAME}
      </motion.h2>
      
      <div className="flex flex-wrap items-center gap-4 mt-3">
        <motion.div 
          className="flex items-center bg-blue-800 bg-opacity-30 px-3 py-1.5 rounded-full"
          variants={itemVariants}
        >
          <FaBuilding className="mr-2" />
          <span>{getOrganizationType(companyInfo.MEMBER_MAIN_GROUP_CODE)}</span>
        </motion.div>
        
        {companyInfo.MEMBER_CODE && (
          <motion.div 
            className="flex items-center bg-blue-800 bg-opacity-30 px-3 py-1.5 rounded-full"
            variants={itemVariants}
          >
            <FaIdCard className="mr-2" />
            รหัสสมาชิก: {companyInfo.MEMBER_CODE}
          </motion.div>
        )}
        
        {/* Member Type Badge */}
        <motion.div 
          className={`flex items-center px-3 py-1.5 rounded-full bg-${memberTypeInfo.color}-100 text-${memberTypeInfo.color}-800`}
          variants={itemVariants}
        >
          <FaUser className="mr-2" />
          <span>{memberTypeInfo.name}</span>
        </motion.div>
        
        {/* Status Badge */}
        <motion.div 
          className={`flex items-center px-3 py-1.5 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
          variants={itemVariants}
        >
          {statusInfo.color === 'green' && <FaCheckCircle className="mr-2" />}
          {statusInfo.color === 'red' && <FaTimesCircle className="mr-2" />}
          {(statusInfo.color === 'yellow' || statusInfo.color === 'orange') && <FaExclamationCircle className="mr-2" />}
          {(statusInfo.color === 'blue' || statusInfo.color === 'purple' || statusInfo.color === 'gray') && <FaInfoCircle className="mr-2" />}
          <span>สถานะ: {statusInfo.name}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}