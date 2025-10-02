"use client";

import { motion } from "framer-motion";

// SectionFlow component to show the current step in the process with icons
export default function SectionFlow({ currentStep, language = "th" }) {
  const steps = [
    {
      id: 1,
      name_th: "เลือกหมวดหมู่ใหญ่",
      name_en: "Select Main Category",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      id: 2,
      name_th: "เลือกหมวดหมู่ย่อย",
      name_en: "Select Subcategory",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5h6a2 2 0 012 2v4h-2V7H9v4H7V7a2 2 0 012-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      id: 3,
      name_th: "ตรวจสอบข้อมูล",
      name_en: "Review Information",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
    },
    {
      id: 4,
      name_th: "ยืนยัน",
      name_en: "Confirm",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  // ข้อความตามภาษาที่เลือก
  const title = language === "th" ? "เพิ่มรหัส TSIC" : "Add TSIC Code";
  const description =
    language === "th"
      ? "เลือกรหัส TSIC ที่อธิบายกิจกรรมทางธุรกิจของคุณได้ดีที่สุด การเลือกของคุณจะปรากฏบน ระบบค้นหาข้อมูลสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย"
      : "Select the TSIC code that best describes your business activities. Your selection will be reviewed and approved by our team within 2 business days.";

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-8">{description}</p>

      <div className="relative px-8">
        {" "}
        {/* เพิ่ม padding ซ้าย-ขวา */}
        {/* เส้นเชื่อมต่อแนวนอนสีเทา - ปรับให้ไม่ชนขอบ */}
        <div
          className="absolute top-7 left-1/2 transform -translate-x-1/2 h-2 bg-gray-200 z-0"
          style={{ width: "calc(100% - 120px)" }}
        >
          {" "}
          {/* ปรับขนาดและตำแหน่ง */}
        </div>
        {/* เส้นความคืบหน้าสีน้ำเงิน - ปรับให้ตรงกับเส้นเทา */}
        <motion.div
          className="absolute top-7 left-1/2 transform -translate-x-1/2 h-2 bg-blue-600 z-0"
          style={{ width: "calc(100% - 120px)" }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{
            clipPath: `inset(0 ${Math.max(0, 100 - ((currentStep - 1) / (steps.length - 1)) * 100)}% 0 0)`,
            transition: { duration: 0.5 },
          }}
        ></motion.div>
        <div className="flex justify-between relative z-10">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isUpcoming = step.id > currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <motion.div
                  className={`flex items-center justify-center w-14 h-14 rounded-full border-2 ${
                    isActive
                      ? "border-blue-600 bg-white shadow-lg"
                      : isCompleted
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300 bg-gray-100"
                  }`}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive ? "#ffffff" : isCompleted ? "#2563eb" : "#f3f4f6",
                    borderColor: isActive || isCompleted ? "#2563eb" : "#d1d5db",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className={isActive ? "text-blue-600" : "text-gray-400"}>{step.icon}</div>
                  )}
                </motion.div>
                <span
                  className={`mt-3 text-sm text-center font-medium max-w-24 leading-tight ${
                    isActive ? "text-blue-600" : isCompleted ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {language === "th" ? step.name_th : step.name_en}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
