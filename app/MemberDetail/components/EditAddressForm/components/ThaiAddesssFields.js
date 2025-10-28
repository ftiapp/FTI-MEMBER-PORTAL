"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ThaiAddressDropdown from "./ThaiAddressDropdown";
import SearchableDropdown from "../../../../membership/shared/SearchableDropdown";

/**
 * Thai address fields component
 */
export default function ThaiAddressFields({ formData, handleChange, itemVariants }) {
  // Postal code handlers
  const handlePostalCodeChange = (value) => {
    handleChange({ target: { name: 'ADDR_POSTCODE', value } });
  };

  const handlePostalCodeSelect = (option) => {
    if (option) {
      // Auto-fill all address fields from postal code selection
      const isBangkokSelected = option.province === 'กรุงเทพมหานคร';
      
      // Set province
      const provinceValue = option.province.includes('จังหวัด') ? option.province : `จังหวัด${option.province}`;
      handleChange({ target: { name: 'ADDR_PROVINCE_NAME', value: provinceValue } });
      
      // Set district
      const districtPrefix = isBangkokSelected ? 'เขต' : 'อำเภอ';
      const districtValue = option.district.includes(districtPrefix) ? option.district : `${districtPrefix}${option.district}`;
      handleChange({ target: { name: 'ADDR_DISTRICT', value: districtValue } });
      
      // Set sub-district
      const subDistrictPrefix = isBangkokSelected ? 'แขวง' : 'ตำบล';
      const subDistrictValue = option.subdistrict.includes(subDistrictPrefix) ? option.subdistrict : `${subDistrictPrefix}${option.subdistrict}`;
      handleChange({ target: { name: 'ADDR_SUB_DISTRICT', value: subDistrictValue } });
      
      // Set postal code
      handleChange({ target: { name: 'ADDR_POSTCODE', value: option.postalCode } });
      
      console.log('📮 Auto-filled address from postal code:', option);
    }
  };

  const fetchPostalCodeOptions = useCallback(async (searchTerm) => {
    try {
      const response = await fetch(`/api/thailand-address/search?query=${encodeURIComponent(searchTerm)}&type=postalCode`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching postal codes:', error);
      return [];
    }
  }, []);

  return (
    <>
      {/* บ้านเลขที่ */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor="ADDR_NO">
          บ้านเลขที่:
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
          หมู่:
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
          ซอย:
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
          ถนน:
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

      {/* Thai Address Dropdowns */}
      <ThaiAddressDropdown
        formData={formData}
        handleChange={handleChange}
        itemVariants={itemVariants}
      />

      {/* รหัสไปรษณีย์ - Searchable */}
      <motion.div className="mb-4" variants={itemVariants}>
        <SearchableDropdown
          label="รหัสไปรษณีย์:"
          placeholder="พิมพ์เพื่อค้นหารหัสไปรษณีย์ (เช่น 10100, 10xxx)"
          value={formData.ADDR_POSTCODE || ''}
          onChange={handlePostalCodeChange}
          onSelect={handlePostalCodeSelect}
          fetchOptions={fetchPostalCodeOptions}
          isRequired={false}
          isReadOnly={false}
        />
        <div className="text-xs text-gray-500 mt-2">
          <span className="inline-flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" clipRule="evenodd" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            พิมพ์รหัสไปรษณีย์เพื่อเติมที่อยู่อัตโนมัติ
          </span>
        </div>
      </motion.div>
    </>
  );
}
