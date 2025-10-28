"use client";

import { motion } from "framer-motion";
import { FaSave, FaTimes } from "react-icons/fa";
import AddressCopyButton from "./AddressCopyButton";

/**
 * Header component for the EditAddressForm
 */
export default function AddressFormHeader({
  addrCode,
  onCancel,
  isSubmitting,
  onSubmit,
  addresses,
  onCopyAddress,
}) {
  return (
    <div className="mb-6 pb-3 border-b">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-blue-700">
          แก้ไขที่อยู่ {addrCode === "001" ? "สำหรับติดต่อ (ทะเบียน)" : addrCode === "002" ? "สำหรับจัดส่งเอกสาร" : "สำหรับออกใบกำกับภาษี"}
        </h3>

        <div className="flex space-x-2">
          {/* Copy button */}
          <AddressCopyButton
            addresses={addresses}
            currentAddrCode={addrCode}
            onCopyAddress={onCopyAddress}
          />
          
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
    </div>
  );
}
