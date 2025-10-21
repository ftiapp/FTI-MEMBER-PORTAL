"use client";

import { motion } from "framer-motion";
import { FaEnvelope, FaCheckCircle, FaReply } from "react-icons/fa";

/**
 * ContactStepIndicator component that shows the contact process steps
 *
 * @param {Object} props Component properties
 * @param {number} props.currentStep The current active step (1-3)
 */
export default function ContactStepIndicator({ currentStep = 1 }) {
  const steps = [
    {
      id: 1,
      icon: <FaEnvelope className="w-4 h-4 md:w-5 md:h-5" />,
      label: "ส่งข้อความติดต่อ",
      description: "กรอกและส่งแบบฟอร์มติดต่อ",
    },
    {
      id: 2,
      icon: <FaCheckCircle className="w-4 h-4 md:w-5 md:h-5" />,
      label: "ยืนยันข้อความติดต่อ",
      description: "ยืนยันข้อมูลการติดต่อ",
    },
    {
      id: 3,
      icon: <FaReply className="w-4 h-4 md:w-5 md:h-5" />,
      label: "แอดมินตอบกลับ",
      description: "ภายใน 2 วันทำการ",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      {/* Desktop/Tablet View - Hidden on small screens and in landscape mode */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Base line across steps */}
          <div
            className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full z-0"
            style={{ top: 24 }}
          />

          {/* Completed progress line */}
          {(() => {
            const totalSegments = Math.max(1, steps.length - 1);
            const completedSegments = Math.min(Math.max(currentStep - 1, 0), totalSegments);
            const progressPercent = (completedSegments / totalSegments) * 100;
            return (
              <motion.div
                className="absolute left-0 h-1 bg-blue-700 rounded-full z-0"
                style={{ top: 24 }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35 }}
              />
            );
          })()}

          {/* Steps */}
          {steps.map((step, index) => {
            const isActive = step.id <= currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10"
                style={{ flex: "1", maxWidth: "200px" }}
              >
                <motion.div
                  className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 bg-white shadow-sm ${
                    isActive ? "border-blue-700" : "border-gray-400"
                  }`}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    borderColor: isActive ? "#1d4ed8" : "#9ca3af",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{
                      color: isActive ? "#1d4ed8" : "#4b5563",
                    }}
                    transition={{ duration: 0.3 }}
                    className={isActive ? "text-blue-700" : "text-gray-600"}
                  >
                    {step.icon}
                  </motion.div>
                </motion.div>

                <div className="mt-3 text-center">
                  <p
                    className={`text-xs md:text-sm font-semibold ${
                      isActive ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 hidden md:block font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Shown on small screens and in landscape mode */}
      <div className="block md:hidden">
        <div className="space-y-4 landscape:flex landscape:space-y-0 landscape:space-x-4 landscape:justify-between landscape:items-start">
          {steps.map((step, index) => {
            const isActive = step.id <= currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                className="flex items-start space-x-4 landscape:flex-col landscape:items-center landscape:space-x-0 landscape:space-y-2 landscape:flex-1"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white ${
                      isActive ? "border-blue-700" : "border-gray-400"
                    }`}
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      borderColor: isActive ? "#1d4ed8" : "#9ca3af",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{
                        color: isActive ? "#1d4ed8" : "#4b5563",
                      }}
                      transition={{ duration: 0.3 }}
                      className={isActive ? "text-blue-700" : "text-gray-600"}
                    >
                      {step.icon}
                    </motion.div>
                  </motion.div>

                  {/* Removing vertical connecting lines */}
                </div>

                <div className="flex-1 pb-2">
                  <p
                    className={`text-sm font-semibold ${
                      isActive ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
