"use client";

import { motion } from "framer-motion";

/**
 * Success message component shown after form submission is successful
 */
export default function SuccessMessage() {
  return (
    <motion.div
      className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg
            className="h-8 w-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-lg font-medium text-green-800">ส่งคำขอแก้ไขที่อยู่เรียบร้อยแล้ว</p>
          <p className="text-sm text-green-700 mt-1">
            คำขอของคุณจะถูกส่งให้ผู้ดูแลระบบตรวจสอบและอนุมัติต่อไป
          </p>
        </div>
      </div>
    </motion.div>
  );
}
