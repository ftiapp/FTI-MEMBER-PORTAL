"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { checkTaxIdUniqueness } from "./OCFormSubmission";

/**
 * Hook สำหรับจัดการการนำทางและ state ของฟอร์มสมัครสมาชิก OC
 * @param {Function} validateForm ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
 * @returns {Object} ฟังก์ชันและ state ที่ใช้ในการนำทาง
 */
export const useOCFormNavigation = (
  validateForm,
  externalCurrentStep,
  externalSetCurrentStep,
  externalTotalSteps,
) => {
  // ใช้ค่าจากภายนอกถ้ามี หรือสร้าง state ใหม่ถ้าไม่มี
  const [internalCurrentStep, setInternalCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ใช้ค่าจากภายนอกถ้ามี
  const currentStep = externalCurrentStep !== undefined ? externalCurrentStep : internalCurrentStep;
  const setCurrentStep = externalSetCurrentStep || setInternalCurrentStep;
  const totalSteps = externalTotalSteps || 5;

  /**
   * ไปยังขั้นตอนถัดไป พร้อมตรวจสอบข้อมูล
   * @param {Object} formData ข้อมูลฟอร์มทั้งหมด
   * @param {Function} setErrors ฟังก์ชันสำหรับกำหนดข้อผิดพลาด
   */
  const handleNextStep = async (formData, setErrors) => {
    // ตรวจสอบความถูกต้องของข้อมูลในขั้นตอนปัจจุบัน
    const errors = validateForm(formData, currentStep);
    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }

    // ตรวจสอบ Tax ID ในขั้นตอนที่ 1
    if (currentStep === 1 && formData.taxId && formData.taxId.length === 13) {
      const isUnique = await checkTaxIdUniqueness(formData.taxId);
      if (!isUnique) return;
    }

    // ไปยังขั้นตอนถัดไป
    setCurrentStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  /**
   * ย้อนกลับไปขั้นตอนก่อนหน้า
   */
  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

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
 * คอมโพเนนต์สำหรับแสดงตัวบอกขั้นตอนการกรอกฟอร์ม
 * @param {Object} props
 * @param {number} props.currentStep ขั้นตอนปัจจุบัน
 * @param {number} props.totalSteps จำนวนขั้นตอนทั้งหมด
 */
export const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center 
                ${
                  currentStep > index + 1
                    ? "bg-green-500 text-white"
                    : currentStep === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                }`}
            >
              {currentStep > index + 1 ? "✓" : index + 1}
            </div>
            <span className="text-xs mt-2">
              {index === 0 && "ข้อมูลบริษัท"}
              {index === 1 && "ข้อมูลผู้แทน"}
              {index === 2 && "ข้อมูลธุรกิจ"}
              {index === 3 && "อัพโหลดเอกสาร"}
              {index === 4 && "ยืนยันข้อมูล"}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-2">
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
        <div
          className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * คอมโพเนนต์สำหรับแสดงปุ่มนำทาง
 * @param {Object} props
 * @param {number} props.currentStep ขั้นตอนปัจจุบัน
 * @param {number} props.totalSteps จำนวนขั้นตอนทั้งหมด
 * @param {Function} props.onPrev ฟังก์ชันเมื่อกดปุ่มย้อนกลับ
 * @param {Function} props.onNext ฟังก์ชันเมื่อกดปุ่มถัดไป
 * @param {Function} props.onSubmit ฟังก์ชันเมื่อกดปุ่มยืนยัน
 * @param {boolean} props.isSubmitting สถานะกำลังส่งข้อมูล
 */
export const NavigationButtons = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <div className="mt-8 flex justify-between">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          ย้อนกลับ
        </button>
      )}
      <div className="ml-auto">
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ถัดไป
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 
              ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "กำลังส่งข้อมูล..." : "ยืนยันการสมัคร"}
          </button>
        )}
      </div>
    </div>
  );
};
