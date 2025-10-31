"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaCopy, FaChevronDown } from "react-icons/fa";
import { toast } from "react-hot-toast";

/**
 * Component for copying address data from other addresses
 */
export default function AddressCopyButton({ addresses, currentAddrCode, onCopyAddress }) {
  const [isOpen, setIsOpen] = useState(false);

  // Get available addresses to copy from (excluding current address)
  const availableAddresses = Object.entries(addresses || {})
    .filter(([addrCode]) => addrCode !== currentAddrCode)
    .map(([addrCode, addrData]) => ({
      code: addrCode,
      data: addrData,
      label: getAddressLabel(addrCode, addrData),
    }));

  if (availableAddresses.length === 0) {
    return null; // Don't show button if no other addresses available
  }

  const handleCopy = (sourceAddress) => {
    onCopyAddress(sourceAddress);
    setIsOpen(false);
    toast.success(`คัดลอกข้อมูลจาก ${sourceAddress.label} แล้ว`);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaCopy className="mr-2" />
        คัดลอกที่อยู่
        <FaChevronDown className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          <div className="p-2">
            <div className="text-xs text-gray-500 font-medium px-3 py-2 border-b border-gray-100">
              เลือกที่อยู่ที่ต้องการคัดลอก:
            </div>
            {availableAddresses.map((addr) => (
              <button
                key={addr.code}
                type="button"
                onClick={() => handleCopy(addr)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors text-sm"
              >
                <div className="font-medium text-gray-900">{addr.label}</div>
                <div className="text-xs text-gray-500 truncate mt-1">
                  {formatAddressPreview(addr.data)}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

function getAddressLabel(addrCode, addrData) {
  const labels = {
    "001": "ที่อยู่สำหรับติดต่อ (ทะเบียน)",
    "002": "ที่อยู่สำหรับจัดส่งเอกสาร",
    "003": "ที่อยู่สำหรับออกใบกำกับภาษี",
  };

  return labels[addrCode] || `ที่อยู่ ${addrCode}`;
}

function formatAddressPreview(addrData) {
  if (!addrData) return "-";

  const parts = [
    addrData.ADDR_NO,
    addrData.ADDR_MOO && `หมู่ ${addrData.ADDR_MOO}`,
    addrData.ADDR_ROAD && `ถนน ${addrData.ADDR_ROAD}`,
    addrData.ADDR_DISTRICT && `อำเภอ ${addrData.ADDR_DISTRICT}`,
    addrData.ADDR_PROVINCE_NAME && `จังหวัด ${addrData.ADDR_PROVINCE_NAME}`,
    addrData.ADDR_POSTCODE,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "-";
}
