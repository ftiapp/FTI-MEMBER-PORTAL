"use client";

import React from "react";
import { FaEnvelope } from "react-icons/fa";

const ContactHeader = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <FaEnvelope className="text-blue-700" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-blue-900">ติดต่อสอบถาม</h2>
      </div>
      <p className="text-gray-600 ml-12">
        หากท่านมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อเราได้ที่นี่
      </p>
    </div>
  );
};

export default ContactHeader;
