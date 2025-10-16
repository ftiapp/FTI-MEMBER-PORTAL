// components/AMFormNavigation.js
"use client";

import { useState, useCallback } from "react";

/**
 * Custom hook สำหรับจัดการการนำทางในฟอร์มสมัครสมาชิกสมาคม
 * @param {Function} validateForm - ฟังก์ชันสำหรับตรวจสอบความถูกต้องของฟอร์ม
 * @returns {Object} - ข้อมูลและฟังก์ชันสำหรับการนำทาง
 */
export const useAMFormNavigation = (validateForm) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  // ฟังก์ชันสำหรับไปยังขั้นตอนถัดไป
  const handleNextStep = useCallback(
    (formData, setErrors) => {
      // ตรวจสอบความถูกต้องของข้อมูลในขั้นตอนปัจจุบัน
      const formErrors = validateForm(formData, currentStep);
      setErrors(formErrors);

      // ถ้าไม่มีข้อผิดพลาด ไปยังขั้นตอนถัดไป
      if (Object.keys(formErrors).length === 0) {
        if (currentStep < totalSteps) {
          setCurrentStep((prev) => prev + 1);
          window.scrollTo(0, 0);
        }
      } else {
        // มี error - scroll ไปหา field แรกที่มี error
        scrollToFirstError(formErrors);
      }
    },
    [currentStep, validateForm],
  );

  // ฟังก์ชัน scroll ไปหา field แรกที่มี error
  const scrollToFirstError = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;

    // หา element แรกที่มี error
    setTimeout(() => {
      for (const key of errorKeys) {
        // ลองหา element หลายรูปแบบ
        const selectors = [
          `[name="${key}"]`,
          `[id="${key}"]`,
          `[data-error-key="${key}"]`,
          `.error-${key}`,
        ];

        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Focus ถ้าเป็น input field
            if (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.tagName === "SELECT") {
              element.focus();
            }
            return;
          }
        }
      }

      // ถ้าหาไม่เจอ ลอง scroll ไปหา error message แรก
      const firstErrorMessage = document.querySelector(".text-red-600, .text-red-500, .border-red-300");
      if (firstErrorMessage) {
        firstErrorMessage.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // ฟังก์ชันสำหรับกลับไปยังขั้นตอนก่อนหน้า
  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  return {
    currentStep,
    setCurrentStep,
    isSubmitting,
    setIsSubmitting,
    totalSteps,
    handleNextStep,
    handlePrevStep,
  };
};

/**
 * คอมโพเนนต์สำหรับแสดงปุ่มนำทางในฟอร์ม
 */
export function NavigationButtons({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}) {
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className={`px-6 py-2 rounded-md font-medium transition-colors ${
          currentStep === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gray-600 text-white hover:bg-gray-700"
        }`}
      >
        ย้อนกลับ
      </button>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          {currentStep} จาก {totalSteps}
        </span>
      </div>

      {currentStep < totalSteps ? (
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          ถัดไป
        </button>
      ) : (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {isSubmitting ? "กำลังส่ง..." : "ส่งข้อมูล"}
        </button>
      )}
    </div>
  );
}
