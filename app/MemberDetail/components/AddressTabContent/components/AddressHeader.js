"use client";

import { motion } from "framer-motion";
import { FaEdit, FaExclamationTriangle, FaPrint } from "react-icons/fa";

/**
 * Header component for address content
 * @param {string} selectedAddress - Currently selected address code
 * @param {boolean} isEditable - Whether the address is editable
 * @param {boolean} hasPendingRequest - Whether there's a pending address update request
 * @param {boolean} isCheckingStatus - Whether checking for pending requests
 * @param {function} setIsEditMode - Function to set edit mode
 * @param {function} handlePrint - Function to handle print
 */
export default function AddressHeader({
  selectedAddress,
  isEditable,
  hasPendingRequest,
  isCheckingStatus,
  setIsEditMode,
  handlePrint,
}) {
  // Helper function to get address type name
  const getAddressTypeName = (code) => {
    switch (code) {
      case "001":
        return "ที่อยู่สำหรับติดต่อ (ทะเบียน)";
      case "002":
        return "ที่อยู่สำหรับจัดส่งเอกสาร";
      case "003":
        return "ที่อยู่สำหรับออกใบกำกับภาษี";
      default:
        return `ที่อยู่ ${code}`;
    }
  };

  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h3 className="text-xl font-semibold text-blue-700 mb-1">
          {getAddressTypeName(selectedAddress || "")}
        </h3>
        <p className="text-gray-500 text-sm">รหัสที่อยู่: {selectedAddress || ""}</p>
      </div>

      {isEditable && (
        <div className="flex space-x-2">
          {hasPendingRequest ? (
            <motion.div
              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FaExclamationTriangle className="mr-2 text-yellow-500" />
              <span className="text-sm">คำขอแก้ไขกำลังรอการอนุมัติ</span>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isCheckingStatus}
            >
              <FaEdit className="mr-2" />
              {isCheckingStatus ? "กำลังตรวจสอบ..." : "แก้ไขที่อยู่"}
            </motion.button>
          )}

          <motion.button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPrint className="mr-2" />
            พิมพ์
          </motion.button>
        </div>
      )}
    </div>
  );
}
