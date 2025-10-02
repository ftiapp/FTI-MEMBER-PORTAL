"use client";

import { motion } from "framer-motion";

/**
 * Thai address fields component
 */
export default function ThaiAddressFields({ formData, handleChange, itemVariants }) {
  return (
    <>
      {/* บ้านเลขที่ */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_NO">
          บ้านเลขที่
        </label>
        <input
          type="text"
          id="ADDR_NO"
          name="ADDR_NO"
          value={formData.ADDR_NO || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* หมู่ */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_MOO">
          หมู่
        </label>
        <input
          type="text"
          id="ADDR_MOO"
          name="ADDR_MOO"
          value={formData.ADDR_MOO || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* ซอย */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_SOI">
          ซอย
        </label>
        <input
          type="text"
          id="ADDR_SOI"
          name="ADDR_SOI"
          value={formData.ADDR_SOI || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* ถนน */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_ROAD">
          ถนน
        </label>
        <input
          type="text"
          id="ADDR_ROAD"
          name="ADDR_ROAD"
          value={formData.ADDR_ROAD || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* ตำบล/แขวง */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_SUB_DISTRICT">
          ตำบล/แขวง
        </label>
        <input
          type="text"
          id="ADDR_SUB_DISTRICT"
          name="ADDR_SUB_DISTRICT"
          value={formData.ADDR_SUB_DISTRICT || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* อำเภอ/เขต */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_DISTRICT">
          อำเภอ/เขต
        </label>
        <input
          type="text"
          id="ADDR_DISTRICT"
          name="ADDR_DISTRICT"
          value={formData.ADDR_DISTRICT || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* จังหวัด */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_PROVINCE_NAME">
          จังหวัด
        </label>
        <input
          type="text"
          id="ADDR_PROVINCE_NAME"
          name="ADDR_PROVINCE_NAME"
          value={formData.ADDR_PROVINCE_NAME || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* รหัสไปรษณีย์ */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_POSTCODE">
          รหัสไปรษณีย์
        </label>
        <input
          type="text"
          id="ADDR_POSTCODE"
          name="ADDR_POSTCODE"
          value={formData.ADDR_POSTCODE || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>
    </>
  );
}
