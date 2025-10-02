"use client";

import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

/**
 * LoadingState component displays a loading spinner with animation
 * @returns {JSX.Element} The loading state UI
 */
const LoadingState = () => (
  <motion.div
    className="bg-white shadow rounded-lg p-6 mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="py-16 flex flex-col items-center justify-center text-gray-600">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <FaSpinner className="text-blue-600 mb-3" size={28} />
      </motion.div>
      <motion.p
        className="font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        กำลังโหลดข้อมูล...
      </motion.p>
    </div>
  </motion.div>
);

export default LoadingState;
