"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * LoadingState component displays a loading spinner with animation
 * @param {string} message - Optional custom loading message
 */
const LoadingState = ({ message = "กำลังโหลดข้อมูล..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <motion.div
      className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.p
      className="mt-4 text-gray-600 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {message}
    </motion.p>
  </div>
);

export default LoadingState;
