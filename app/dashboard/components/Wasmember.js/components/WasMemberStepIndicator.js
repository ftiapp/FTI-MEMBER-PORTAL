"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaUserCheck,
  FaClipboardCheck,
  FaCheckCircle,
  FaBuilding,
  FaFileAlt,
  FaEye,
} from "react-icons/fa";

const WasMemberStepIndicator = ({ currentStep }) => {
  const steps = [
    {
      title: "เลือกบริษัท",
      icon: <FaBuilding className="w-5 h-5" />,
      description: "เลือกบริษัทสมาชิกเดิม (สูงสุด 10 บริษัท)",
    },
    {
      title: "อัพโหลดเอกสาร",
      icon: <FaClipboardCheck className="w-5 h-5" />,
      description: "อัพโหลดเอกสารยืนยันตัวตน",
    },
    {
      title: "ตรวจสอบข้อมูล",
      icon: <FaEye className="w-5 h-5" />,
      description: "ตรวจสอบข้อมูลและเอกสารทั้งหมด",
    },
    {
      title: "ยืนยันตัวตนสำเร็จ",
      icon: <FaCheckCircle className="w-5 h-5" />,
      description: "การยืนยันตัวตนเสร็จสมบูรณ์",
    },
  ];

  return (
    <div className="w-full py-4 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center relative">
        {/* Desktop: Horizontal connector line */}
        <div
          className="hidden md:block absolute left-0 right-0 h-1 bg-gray-200 rounded-full z-0"
          style={{ top: 30 }}
        />

        {/* Desktop: Completed progress line */}
        {(() => {
          const totalSegments = Math.max(1, steps.length - 1);
          const completedSegments = Math.min(Math.max(currentStep - 1, 0), totalSegments);
          const progressPercent = (completedSegments / totalSegments) * 100;
          return (
            <motion.div
              className="hidden md:block absolute left-0 h-1 bg-blue-600 rounded-full z-0"
              style={{ top: 30 }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35 }}
            />
          );
        })()}

        {/* Mobile: Vertical connector line */}
        <div
          className="md:hidden absolute left-6 top-0 bottom-0 w-1 bg-gray-200 rounded-full z-0"
        />

        {/* Mobile: Completed vertical progress line */}
        {(() => {
          const totalSegments = Math.max(1, steps.length - 1);
          const completedSegments = Math.min(Math.max(currentStep - 1, 0), totalSegments);
          const progressPercent = (completedSegments / totalSegments) * 100;
          return (
            <motion.div
              className="md:hidden absolute left-6 top-0 w-1 bg-blue-600 rounded-full z-0"
              initial={{ height: 0 }}
              animate={{ height: `${progressPercent}%` }}
              transition={{ duration: 0.35 }}
            />
          );
        })()}

        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;

          return (
            <div
              key={index}
              className="flex flex-row md:flex-col items-start md:items-center mb-8 last:mb-0 md:mb-0 relative z-10 w-full md:max-w-[200px]"
            >
              {/* Step Circle */}
              <motion.div
                className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full mr-4 md:mr-0 md:mb-2 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {step.icon}
              </motion.div>

              {/* Text content */}
              <div className="flex-1 md:flex-none md:w-full">
                {/* Step Title */}
                <motion.p
                  className={`text-sm md:text-sm font-medium text-left md:text-center ${
                    isActive ? "text-blue-600" : isCompleted ? "text-green-500" : "text-gray-500"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                >
                  {step.title}
                </motion.p>

                {/* Step Description */}
                <motion.p
                  className="text-xs text-gray-500 text-left md:text-center mt-1 md:px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                >
                  {step.description}
                </motion.p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WasMemberStepIndicator;