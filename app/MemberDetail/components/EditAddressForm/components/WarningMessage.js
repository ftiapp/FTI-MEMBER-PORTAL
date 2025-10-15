"use client";

import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

/**
 * Warning message component to inform FTI_Portal_User about the approval process
 */
export default function WarningMessage({ itemVariants }) {
  return (
    <motion.div
      className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-md"
      variants={itemVariants}
    >
      <div className="flex items-center">
        <FaExclamationTriangle className="mr-2 text-blue-500" />
        <p>การแก้ไขที่อยู่จะได้รับการตรวจสอบและอนุมัติจากผู้ดูแลระบบ ภายใน 2 วันทำการ</p>
      </div>
    </motion.div>
  );
}
