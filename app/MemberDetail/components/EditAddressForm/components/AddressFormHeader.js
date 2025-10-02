"use client";

import { motion } from "framer-motion";
import { FaSave, FaTimes } from "react-icons/fa";

/**
 * Header component for the EditAddressForm
 */
export default function AddressFormHeader({
  addrCode,
  activeLanguage,
  handleLanguageChange,
  onCancel,
  isSubmitting,
  onSubmit,
}) {
  return (
    <div className="mb-6 pb-3 border-b">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-blue-700">
          แก้ไขที่อยู่ {addrCode === "001" ? "สำหรับติดต่อ (ทะเบียน)" : "สำหรับจัดส่งเอกสาร"}
        </h3>

        <div className="flex space-x-2">
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            <FaTimes className="mr-2" />
            ยกเลิก
          </motion.button>

          {/*<motion.button
            type="submit"
            onClick={onSubmit}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
          >
            <FaSave className="mr-2" />
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'บันทึกการแก้ไข'}
          </motion.button> */}
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex border-b mb-4">
        <button
          type="button"
          className={`px-4 py-2 font-medium text-sm ${activeLanguage === "th" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => handleLanguageChange("th")}
        >
          ภาษาไทย
        </button>
        <button
          type="button"
          className={`px-4 py-2 font-medium text-sm ${activeLanguage === "en" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => handleLanguageChange("en")}
        >
          English
        </button>
      </div>
    </div>
  );
}
