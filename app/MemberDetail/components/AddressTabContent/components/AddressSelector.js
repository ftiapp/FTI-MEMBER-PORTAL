"use client";

import { motion } from "framer-motion";

/**
 * Address selector component that displays address type buttons
 * @param {Object} addresses - Object containing address data
 * @param {string} selectedAddress - Currently selected address code
 * @param {function} onAddressSelect - Function to handle address selection
 */
export default function AddressSelector({ addresses = {}, selectedAddress, onAddressSelect }) {
  // Ensure addresses is an object
  const safeAddresses = addresses && typeof addresses === "object" ? addresses : {};

  // Animation variants for items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

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
    <div className="mb-6 flex flex-wrap gap-2">
      {Object.keys(safeAddresses).map((addrCode) => (
        <motion.button
          key={addrCode}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedAddress === addrCode
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
          onClick={() => onAddressSelect(addrCode)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          variants={itemVariants}
        >
          {getAddressTypeName(addrCode)}
        </motion.button>
      ))}
    </div>
  );
}
