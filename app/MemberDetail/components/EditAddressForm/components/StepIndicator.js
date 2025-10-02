"use client";

import { motion } from "framer-motion";
import { FaEdit, FaFileUpload, FaPaperPlane, FaUserCheck } from "react-icons/fa";

/**
 * StepIndicator component that shows the current step in the address update process
 *
 * @param {Object} props Component properties
 * @param {number} props.currentStep The current active step (1-4)
 * @param {string} props.addrCode The address code (001, 002, or 003)
 */
export default function StepIndicator({ currentStep = 1, addrCode = "001" }) {
  // For address type 002, we skip the document upload step
  const skipDocumentStep = addrCode === "002";

  // Define document type based on address code
  let documentType = "";
  if (addrCode === "001") {
    documentType = "หนังสือรับรองนิติบุคคล";
  } else if (addrCode === "003") {
    documentType = "ภ.พ.20";
  }

  // Define steps based on address code
  let steps = [
    {
      id: 1,
      icon: <FaEdit className="w-5 h-5" />,
      label: "ส่งข้อมูลแก้ไข",
      description: "แก้ไขข้อมูลที่อยู่ (TH/EN)",
    },
  ];

  // Add document step only for address types 001 and 003
  if (!skipDocumentStep) {
    steps.push({
      id: 2,
      icon: <FaFileUpload className="w-5 h-5" />,
      label: "แนบเอกสาร",
      description: documentType,
    });
  }

  // Add remaining steps
  steps = [
    ...steps,
    {
      id: skipDocumentStep ? 2 : 3,
      icon: <FaPaperPlane className="w-5 h-5" />,
      label: "ส่งข้อมูล",
    },
    {
      id: skipDocumentStep ? 3 : 4,
      icon: <FaUserCheck className="w-5 h-5" />,
      label: "รอการอนุมัติ",
      description: "แอดมินตรวจสอบยืนยัน",
    },
  ];

  return (
    <div className="w-full mb-8">
      <div className="relative">
        {/* Base line across all steps */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full z-0" />

        {/* Completed progress line */}
        {(() => {
          const totalSegments = Math.max(1, steps.length - 1);
          const activeIndex = Math.max(
            0,
            steps.findIndex((s) => s.id === currentStep),
          );
          const completedSegments = Math.min(activeIndex, totalSegments);
          const progressPercent = (completedSegments / totalSegments) * 100;
          return (
            <motion.div
              className="absolute top-5 left-0 h-1 bg-blue-500 rounded-full z-0"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          );
        })()}

        {/* Steps row on top of lines */}
        <div className="flex justify-between items-start relative z-10">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = currentStep > step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1 px-2">
                {/* Step circle with icon */}
                <motion.div
                  className={`z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-500"
                      : isCompleted
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                  }`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {step.icon}
                </motion.div>

                {/* Step label with number */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      !isUpcoming ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {step.id}. {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1 hidden md:block">{step.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
