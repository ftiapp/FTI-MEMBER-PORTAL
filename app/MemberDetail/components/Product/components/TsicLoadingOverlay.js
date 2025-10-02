"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function TsicLoadingOverlay({ isVisible, message }) {
  if (!isVisible) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[200000] flex items-center justify-center"
      style={{ pointerEvents: "auto" }}
    >
      {/* Backdrop - freeze ทั้งหน้า */}
      <div className="absolute inset-0 bg-gray-900 opacity-75 z-[200000]"></div>

      {/* Loading popup */}
      <motion.div
        className="relative z-[200001] bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="relative mb-6">
            <svg
              className="animate-spin h-16 w-16 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>

          {/* Loading text */}
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {message || "กำลังส่งข้อมูล"}
          </h3>
          <p className="text-gray-600 text-center">กรุณาอย่าปิดหน้าต่างนี้</p>

          {/* Progress dots animation */}
          <div className="flex space-x-2 mt-4">
            <motion.div
              className="w-2 h-2 bg-blue-600 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-600 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-600 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(overlay, document.body);
  }
  return overlay;
}
