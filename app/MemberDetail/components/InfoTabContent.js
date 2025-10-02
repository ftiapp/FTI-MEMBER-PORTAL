"use client";

import { motion } from "framer-motion";
import {
  FaBuilding,
  FaIdCard,
  FaUsers,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaIndustry,
  FaCity,
} from "react-icons/fa";

/**
 * Info tab content for the member detail page
 */
export default function InfoTabContent({
  companyInfo,
  memberTypeInfo,
  statusInfo,
  getOrganizationType,
  containerVariants,
  itemVariants,
  multipleCompanies,
}) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="space-y-5" variants={itemVariants}>
          <motion.h3
            className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center"
            variants={itemVariants}
          >
            <FaBuilding className="mr-2 text-blue-600" />
            ข้อมูลบริษัท
          </motion.h3>

          <motion.div
            className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <FaBuilding className="mt-1 mr-3 text-blue-500" />
            <div>
              <p className="font-medium text-blue-900">ชื่อบริษัท</p>
              <p className="text-gray-700 font-semibold">{companyInfo.COMPANY_NAME || "-"}</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <FaIdCard className="mt-1 mr-3 text-blue-500" />
            <div>
              <p className="font-medium text-blue-900">เลขประจำตัวผู้เสียภาษี</p>
              <p className="text-gray-700 font-semibold">{companyInfo.TAX_ID || "-"}</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <FaUsers className="mt-1 mr-3 text-blue-500" />
            <div>
              <p className="font-medium text-blue-900">ประเภทสมาชิก</p>
              <p className="text-gray-700 font-semibold">
                {getOrganizationType(companyInfo.MEMBER_MAIN_GROUP_CODE)}
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="space-y-5" variants={itemVariants}>
          <motion.h3
            className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center"
            variants={itemVariants}
          >
            <FaIdCard className="mr-2 text-blue-600" />
            ข้อมูลสมาชิก
          </motion.h3>

          <motion.div
            className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <FaIdCard className="mt-1 mr-3 text-blue-500" />
            <div>
              <p className="font-medium text-blue-900">รหัสสมาชิก</p>
              <p className="text-gray-700 font-semibold">{companyInfo.MEMBER_CODE || "-"}</p>
            </div>
          </motion.div>

          {/* Member Type Information */}
          <motion.div
            className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <FaUser className="mt-1 mr-3 text-blue-500" />
            <div>
              <p className="font-medium text-blue-900">ประเภทสมาชิก</p>
              <p className="text-gray-700">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${memberTypeInfo.color}-100 text-${memberTypeInfo.color}-800`}
                >
                  {memberTypeInfo.name}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Status Information */}
          <motion.div
            className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            {statusInfo.color === "green" && <FaCheckCircle className="mt-1 mr-3 text-green-500" />}
            {statusInfo.color === "red" && <FaTimesCircle className="mt-1 mr-3 text-red-500" />}
            {(statusInfo.color === "yellow" || statusInfo.color === "orange") && (
              <FaExclamationCircle className="mt-1 mr-3 text-yellow-500" />
            )}
            {(statusInfo.color === "blue" ||
              statusInfo.color === "purple" ||
              statusInfo.color === "gray") && <FaInfoCircle className="mt-1 mr-3 text-blue-500" />}
            <div>
              <p className="font-medium text-blue-900">สถานะสมาชิก</p>
              <p className="text-gray-700">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}
                >
                  {statusInfo.name}
                </span>
              </p>
            </div>
          </motion.div>

          {companyInfo.MEMBER_MAIN_GROUP_CODE === "100" && (
            <motion.div
              className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            >
              <FaIndustry className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="font-medium text-blue-900">กลุ่มอุตสาหกรรม</p>
                <p className="text-gray-700 font-semibold">
                  {companyInfo.Industry_GROUP_NAME || "-"}
                </p>
              </div>
            </motion.div>
          )}

          {companyInfo.MEMBER_MAIN_GROUP_CODE === "200" && (
            <motion.div
              className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            >
              <FaCity className="mt-1 mr-3 text-blue-500" />
              <div>
                <p className="font-medium text-blue-900">สภาอุตสาหกรรมจังหวัด</p>
                <p className="text-gray-700 font-semibold">
                  {companyInfo.Province_GROUP_NAME || "-"}
                </p>
              </div>
            </motion.div>
          )}

          {companyInfo.MEMBER_MAIN_GROUP_CODE === "000" && (
            <motion.div
              className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            ></motion.div>
          )}
        </motion.div>
      </motion.div>

      {multipleCompanies && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">
            <strong>หมายเหตุ:</strong> บริษัทนี้มีข้อมูลหลายรายการที่มีรหัสทะเบียน (REGIST_CODE)
            เดียวกัน
          </p>
        </div>
      )}
    </motion.div>
  );
}
