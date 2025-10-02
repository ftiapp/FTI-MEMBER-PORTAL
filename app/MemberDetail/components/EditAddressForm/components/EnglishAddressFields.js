"use client";

import { motion } from "framer-motion";

/**
 * English address fields component
 */
export default function EnglishAddressFields({ formData, handleChange, itemVariants }) {
  return (
    <>
      {/* House Number */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_NO_EN">
          House Number
        </label>
        <input
          type="text"
          id="ADDR_NO_EN"
          name="ADDR_NO_EN"
          value={formData.ADDR_NO_EN || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Village No. */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_MOO_EN">
          Village No.
        </label>
        <input
          type="text"
          id="ADDR_MOO_EN"
          name="ADDR_MOO_EN"
          value={formData.ADDR_MOO_EN || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Soi/Lane */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_SOI_EN">
          Soi/Lane
        </label>
        <input
          type="text"
          id="ADDR_SOI_EN"
          name="ADDR_SOI_EN"
          value={formData.ADDR_SOI_EN || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Road */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_ROAD_EN">
          Road
        </label>
        <input
          type="text"
          id="ADDR_ROAD_EN"
          name="ADDR_ROAD_EN"
          value={formData.ADDR_ROAD_EN || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Sub-district */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_SUB_DISTRICT_EN">
          Sub-district
        </label>
        <input
          type="text"
          id="ADDR_SUB_DISTRICT_EN"
          name="ADDR_SUB_DISTRICT_EN"
          value={formData.ADDR_SUB_DISTRICT_EN || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* District */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_DISTRICT_EN">
          District
        </label>
        <input
          type="text"
          id="ADDR_DISTRICT_EN"
          name="ADDR_DISTRICT_EN"
          value={formData.ADDR_DISTRICT_EN || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Province */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_PROVINCE_NAME_EN">
          Province
        </label>
        <input
          type="text"
          id="ADDR_PROVINCE_NAME_EN"
          name="ADDR_PROVINCE_NAME_EN"
          value={formData.ADDR_PROVINCE_NAME_EN || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Postal Code */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_POSTCODE_EN">
          Postal Code
        </label>
        <input
          type="text"
          id="ADDR_POSTCODE_EN"
          name="ADDR_POSTCODE_EN"
          value={formData.ADDR_POSTCODE_EN || ""}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>
    </>
  );
}
