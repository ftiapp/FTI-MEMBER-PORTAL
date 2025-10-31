"use client";

import { motion } from "framer-motion";

/**
 * Contact information fields component
 * Handles Thai contact fields only
 */
export default function ContactFields({ formData, handleChange, itemVariants }) {
  return (
    <>
      <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-800">ข้อมูลติดต่อ</h3>
      </div>

      {/* Telephone */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_TELEPHONE">
          โทรศัพท์:
        </label>
        <input
          type="text"
          id="ADDR_TELEPHONE"
          name="ADDR_TELEPHONE"
          value={formData.ADDR_TELEPHONE || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Fax */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_FAX">
          โทรสาร:
        </label>
        <input
          type="text"
          id="ADDR_FAX"
          name="ADDR_FAX"
          value={formData.ADDR_FAX || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Email */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_EMAIL">
          อีเมล:
        </label>
        <input
          type="text"
          id="ADDR_EMAIL"
          name="ADDR_EMAIL"
          value={formData.ADDR_EMAIL || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Website */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_WEBSITE">
          เว็บไซต์:
        </label>
        <input
          type="text"
          id="ADDR_WEBSITE"
          name="ADDR_WEBSITE"
          value={formData.ADDR_WEBSITE || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>
    </>
  );
}
