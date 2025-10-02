"use client";

import { motion } from "framer-motion";
import {
  FaBuilding,
  FaIdCard,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaIndustry,
  FaCity,
} from "react-icons/fa";

/**
 * Header component for the member detail page
 * Displays company name, type, member code, and status
 */
export default function MemberDetailHeader({
  companyInfo,
  memberTypeInfo,
  statusInfo,
  getOrganizationType,
  itemVariants,
  memberTypeTitle,
  selectedMemberType,
}) {
  return (
    <motion.div
      className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6"
      variants={itemVariants}
    >
      <motion.h2
        className="text-2xl font-bold mb-2"
        variants={itemVariants}
        key={companyInfo.COMPANY_NAME}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {companyInfo.COMPANY_NAME}
      </motion.h2>

      {memberTypeTitle && (
        <motion.div className="text-lg font-medium mb-3 flex items-center" variants={itemVariants}>
          {selectedMemberType === "000" && <FaBuilding className="mr-2" />}
          {selectedMemberType === "100" && <FaIndustry className="mr-2" />}
          {selectedMemberType === "200" && <FaCity className="mr-2" />}
          <span>{memberTypeTitle}</span>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-3">
        {!selectedMemberType && (
          <motion.div
            className="flex items-center bg-blue-800 bg-opacity-30 px-3 py-1.5 rounded-full"
            variants={itemVariants}
          >
            <FaBuilding className="mr-2" />
            <span>{getOrganizationType(companyInfo.MEMBER_MAIN_GROUP_CODE)}</span>
          </motion.div>
        )}

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
          className={`flex items-center px-3 py-1.5 rounded-full ${memberTypeInfo.color === "blue" ? "bg-blue-100 text-blue-800" : memberTypeInfo.color === "green" ? "bg-green-100 text-green-800" : memberTypeInfo.color === "red" ? "bg-red-100 text-red-800" : memberTypeInfo.color === "yellow" ? "bg-yellow-100 text-yellow-800" : memberTypeInfo.color === "purple" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}
          variants={itemVariants}
        >
          <FaUser className="mr-2" />
          <span>{memberTypeInfo.name}</span>
        </motion.div>

        {/* Status Badge */}
        <motion.div
          className={`flex items-center px-3 py-1.5 rounded-full ${statusInfo.color === "green" ? "bg-green-100 text-green-800" : statusInfo.color === "red" ? "bg-red-100 text-red-800" : statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-800" : statusInfo.color === "orange" ? "bg-orange-100 text-orange-800" : statusInfo.color === "blue" ? "bg-blue-100 text-blue-800" : statusInfo.color === "purple" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}
          variants={itemVariants}
        >
          {statusInfo.color === "green" && <FaCheckCircle className="mr-2" />}
          {statusInfo.color === "red" && <FaTimesCircle className="mr-2" />}
          {(statusInfo.color === "yellow" || statusInfo.color === "orange") && (
            <FaExclamationCircle className="mr-2" />
          )}
          {(statusInfo.color === "blue" ||
            statusInfo.color === "purple" ||
            statusInfo.color === "gray") && <FaInfoCircle className="mr-2" />}
          <span>สถานะ: {statusInfo.name}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
