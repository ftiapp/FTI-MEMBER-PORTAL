"use client";

import { motion } from "framer-motion";
import { FaInfoCircle } from "react-icons/fa";

/**
 * Debug information component for address data
 * @param {boolean} hasAddresses - Whether addresses exist
 * @param {boolean} selectedAddressExists - Whether selected address exists
 * @param {string} selectedAddress - Currently selected address code
 * @param {Object} addresses - Object containing address data
 */
export default function DebugInfoBar({
  hasAddresses,
  selectedAddressExists,
  selectedAddress,
  addresses = {},
}) {
  if (hasAddresses && !selectedAddressExists) {
    return (
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-300 flex items-center text-sm">
        <FaInfoCircle className="text-yellow-500 mr-2 flex-shrink-0" />
        <div>
          <p className="font-semibold">ข้อมูลการแก้ไขจุดบกพร่อง:</p>
          <p>
            พบที่อยู่ ({Object.keys(addresses).length}) แต่ไม่พบข้อมูลที่อยู่ที่เลือก (
            {selectedAddress})
          </p>
          <p className="mt-1 text-xs">รหัสที่อยู่ที่มี: {Object.keys(addresses).join(", ")}</p>
        </div>
      </div>
    );
  }

  return null;
}
