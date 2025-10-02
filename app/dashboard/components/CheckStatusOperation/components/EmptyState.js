import React from "react";
import { FaInfoCircle } from "react-icons/fa";

const EmptyState = ({ message = "ไม่พบรายการข้อมูล" }) => {
  return (
    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
      <FaInfoCircle className="mx-auto text-gray-400 mb-2" size={24} />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default EmptyState;
