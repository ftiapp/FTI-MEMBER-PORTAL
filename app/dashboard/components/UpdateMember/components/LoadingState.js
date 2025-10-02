import React from "react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const LoadingState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow rounded-lg p-6 mb-6"
    >
      <div className="py-16 flex flex-col items-center justify-center text-gray-600">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaSpinner className="text-blue-600 mb-3" size={28} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-medium"
        >
          กำลังโหลดข้อมูล...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingState;
