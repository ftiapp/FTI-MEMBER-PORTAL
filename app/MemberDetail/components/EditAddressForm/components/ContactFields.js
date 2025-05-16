'use client';

import { motion } from 'framer-motion';

/**
 * Contact information fields component
 * Handles both Thai and English contact fields
 */
export default function ContactFields({ formData, handleChange, itemVariants, activeLanguage }) {
  // Determine which language's fields to use
  const isThai = activeLanguage === 'th';
  
  return (
    <>
      <div className="md:col-span-2 border-b border-gray-200 pb-2 mb-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-800">
          {isThai ? 'ข้อมูลติดต่อ' : 'Contact Information'}
        </h3>
      </div>
      
      {/* Telephone */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor={isThai ? "ADDR_TELEPHONE" : "ADDR_TELEPHONE_EN"}>
          {isThai ? 'โทรศัพท์' : 'Telephone'}
        </label>
        <input
          type="text"
          id={isThai ? "ADDR_TELEPHONE" : "ADDR_TELEPHONE_EN"}
          name={isThai ? "ADDR_TELEPHONE" : "ADDR_TELEPHONE_EN"}
          value={isThai ? (formData.ADDR_TELEPHONE || '') : (formData.ADDR_TELEPHONE_EN || '')}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>
      
      {/* Fax */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor={isThai ? "ADDR_FAX" : "ADDR_FAX_EN"}>
          {isThai ? 'โทรสาร' : 'Fax'}
        </label>
        <input
          type="text"
          id={isThai ? "ADDR_FAX" : "ADDR_FAX_EN"}
          name={isThai ? "ADDR_FAX" : "ADDR_FAX_EN"}
          value={isThai ? (formData.ADDR_FAX || '') : (formData.ADDR_FAX_EN || '')}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>
      
      {/* Email */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor={isThai ? "ADDR_EMAIL" : "ADDR_EMAIL_EN"}>
          {isThai ? 'อีเมล' : 'Email'}
        </label>
        <input
          type="text"
          id={isThai ? "ADDR_EMAIL" : "ADDR_EMAIL_EN"}
          name={isThai ? "ADDR_EMAIL" : "ADDR_EMAIL_EN"}
          value={isThai ? (formData.ADDR_EMAIL || '') : (formData.ADDR_EMAIL_EN || '')}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>
      
      {/* Website */}
      <motion.div className="mb-4" variants={itemVariants}>
        <label className="block text-gray-700 font-medium mb-2" htmlFor={isThai ? "ADDR_WEBSITE" : "ADDR_WEBSITE_EN"}>
          {isThai ? 'เว็บไซต์' : 'Website'}
        </label>
        <input
          type="text"
          id={isThai ? "ADDR_WEBSITE" : "ADDR_WEBSITE_EN"}
          name={isThai ? "ADDR_WEBSITE" : "ADDR_WEBSITE_EN"}
          value={isThai ? (formData.ADDR_WEBSITE || '') : (formData.ADDR_WEBSITE_EN || '')}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>
    </>
  );
}