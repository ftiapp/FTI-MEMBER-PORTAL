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
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <motion.button
              onClick={() => !hasPendingRequest && !isCheckingStatus && setIsEditMode(true)}
              className={`px-4 py-2 rounded-md flex items-center transition-all ${
                hasPendingRequest || isCheckingStatus
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
              }`}
              whileHover={!hasPendingRequest && !isCheckingStatus ? { scale: 1.05 } : {}}
              whileTap={!hasPendingRequest && !isCheckingStatus ? { scale: 0.95 } : {}}
              disabled={hasPendingRequest || isCheckingStatus}
              title={hasPendingRequest ? "มีคำขอแก้ไขที่รออนุมัติอยู่" : ""}
            >
              <FaEdit className="mr-2" />
              {isCheckingStatus ? "กำลังตรวจสอบ..." : "แก้ไขที่อยู่"}
            </motion.button>

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

          {/* Warning message when there's a pending request */}
          {hasPendingRequest && (
            <motion.div
              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md flex items-center border border-yellow-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaExclamationTriangle className="mr-2 text-yellow-500 flex-shrink-0" />
              <span className="text-sm font-medium">
                คำขอแก้ไขที่อยู่นี้กำลังรอการอนุมัติจากเจ้าหน้าที่
              </span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
