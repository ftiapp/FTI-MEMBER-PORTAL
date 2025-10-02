"use client";

import { motion } from "framer-motion";
import { FaBuilding, FaIndustry, FaCity, FaIdCard, FaUsers } from "react-icons/fa";

/**
 * MembershipTabContent displays all membership types for a member
 * It handles different types of memberships based on MEMBER_MAIN_GROUP_CODE (000, 100, 200)
 * and MEMBER_GROUP_CODE
 *
 * @param {Object} props Component properties
 * @param {Object} props.membershipTypes Object containing all membership types
 * @param {Object} props.companyInfo Company information
 * @param {Object} props.containerVariants Animation variants for container
 * @param {Object} props.itemVariants Animation variants for items
 */
export default function MembershipTabContent({
  membershipTypes,
  companyInfo,
  containerVariants,
  itemVariants,
}) {
  // Check if there are any membership types
  const hasMemberships = Object.keys(membershipTypes).length > 0;

  if (!hasMemberships) {
    return (
      <motion.div
        className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p>ไม่พบข้อมูลการเป็นสมาชิก</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* สภาอุตสาหกรรมแห่งประเทศไทย (000) */}
        {membershipTypes["000"] && (
          <motion.div
            className="bg-white p-5 rounded-lg shadow-md border border-blue-100"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-medium text-blue-600 border-b border-blue-200 pb-2 mb-4 flex items-center"
              variants={itemVariants}
            >
              <FaBuilding className="mr-2 text-blue-600" />
              สภาอุตสาหกรรมแห่งประเทศไทย
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(membershipTypes["000"]).map(([groupCode, groupInfo]) => (
                <motion.div
                  key={`000-${groupCode}`}
                  className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <FaIdCard className="mt-1 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-900">
                      รหัสสมาชิก: {companyInfo.MEMBER_CODE}
                    </p>
                    <p className="text-gray-700 font-semibold">{groupInfo.name}</p>
                    <p className="text-gray-500 text-sm">{groupInfo.nameEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* กลุ่มอุตสาหกรรม (100) */}
        {membershipTypes["100"] && (
          <motion.div
            className="bg-white p-5 rounded-lg shadow-md border border-green-100"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-medium text-green-600 border-b border-green-200 pb-2 mb-4 flex items-center"
              variants={itemVariants}
            >
              <FaIndustry className="mr-2 text-green-600" />
              กลุ่มอุตสาหกรรม
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(membershipTypes["100"]).map(([groupCode, groupInfo]) => (
                <motion.div
                  key={`100-${groupCode}`}
                  className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <FaIndustry className="mt-1 mr-3 text-green-500" />
                  <div>
                    <p className="font-medium text-green-900">รหัสกลุ่ม: {groupCode}</p>
                    <p className="text-gray-700 font-semibold">{groupInfo.name}</p>
                    <p className="text-gray-500 text-sm">{groupInfo.nameEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* สภาอุตสาหกรรมจังหวัด (200) */}
        {membershipTypes["200"] && (
          <motion.div
            className="bg-white p-5 rounded-lg shadow-md border border-purple-100"
            variants={itemVariants}
          >
            <motion.h3
              className="text-lg font-medium text-purple-600 border-b border-purple-200 pb-2 mb-4 flex items-center"
              variants={itemVariants}
            >
              <FaCity className="mr-2 text-purple-600" />
              สภาอุตสาหกรรมจังหวัด
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(membershipTypes["200"]).map(([groupCode, groupInfo]) => (
                <motion.div
                  key={`200-${groupCode}`}
                  className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <FaCity className="mt-1 mr-3 text-purple-500" />
                  <div>
                    <p className="font-medium text-purple-900">รหัสจังหวัด: {groupCode}</p>
                    <p className="text-gray-700 font-semibold">{groupInfo.name}</p>
                    <p className="text-gray-500 text-sm">{groupInfo.nameEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-blue-700">
          <strong>หมายเหตุ:</strong> สมาชิกสามารถเป็นสมาชิกได้หลายประเภท เช่น
          เป็นทั้งสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย และสมาชิกกลุ่มอุตสาหกรรม
        </p>
      </motion.div>
    </motion.div>
  );
}
