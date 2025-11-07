"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

/**
 * ฟังก์ชันสำหรับตรวจสอบความซ้ำของ Tax ID (เหมือน OC)
 * @param {string} taxId เลขประจำตัวผู้เสียภาษี
 * @returns {boolean} true หากใช้ได้, false หากซ้ำ
 */
export const checkTaxIdUniqueness = async (taxId) => {
  if (!taxId || taxId.length !== 13) return false;

  try {
    const response = await fetch("/api/member/ac-membership/check-tax-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taxId }),
    });

    const data = await response.json();

    if (!data.valid) {
      toast.error(data.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking tax ID uniqueness:", error);
    toast.error("เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี");
    return false;
  }
};

/**
 * Hook สำหรับจัดการการนำทางและ state ของฟอร์มสมัครสมาชิก AC (สมทบ-นิติบุคคล)
 * @param {Function} validateForm ฟังก์ชันตรวจสอบความถูกต้องของข้อมูล
 * @param {number} externalCurrentStep ขั้นตอนปัจจุบันจากภายนอก (optional)
 * @param {Function} externalSetCurrentStep ฟังก์ชันเปลี่ยนขั้นตอนจากภายนอก (optional)
 * @param {number} externalTotalSteps จำนวนขั้นตอนทั้งหมดจากภายนอก (optional)
 * @returns {Object} ฟังก์ชันและ state ที่ใช้ในการนำทาง
 */
export const useACFormNavigation = (
  validateForm,
  externalCurrentStep,
  externalSetCurrentStep,
  externalTotalSteps,
) => {
  // ใช้ค่าจากภายนอกถ้ามี หรือสร้าง state ใหม่ถ้าไม่มี
  const [internalCurrentStep, setInternalCurrentStep] = useState(1);
  const [internalTotalSteps] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = externalCurrentStep ?? internalCurrentStep;
  const setCurrentStep = externalSetCurrentStep ?? setInternalCurrentStep;
  const totalSteps = externalTotalSteps ?? internalTotalSteps;

  const validateCurrentStep = (formData, selectedFiles) => {
    const errors = validateForm(formData, currentStep, selectedFiles);
    return errors;
  };

  /**
   * ไปยังขั้นตอนถัดไป พร้อมตรวจสอบข้อมูล
   * @param {Object} formData ข้อมูลฟอร์มทั้งหมด
   * @param {Function} setErrors ฟังก์ชันสำหรับกำหนดข้อผิดพลาด
   */
  const handleNextStep = async (formData, setErrors, selectedFiles) => {
    // ตรวจสอบความถูกต้องของข้อมูลในขั้นตอนปัจจุบัน
    const errors = validateCurrentStep(formData, selectedFiles);
    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      // สร้าง error message ที่ละเอียดสำหรับ representatives
      let errorMessage = "";
      let errorCount = 0;

      if (errors.representativeErrors && Array.isArray(errors.representativeErrors)) {
        const repErrors = errors.representativeErrors;
        const repErrorDetails = [];

        repErrors.forEach((repError, index) => {
          if (repError && Object.keys(repError).length > 0) {
            const fieldNames = Object.keys(repError)
              .map((key) => {
                const fieldMap = {
                  prename_th: "คำนำหน้าชื่อ (ไทย)",
                  prename_en: "คำนำหน้าชื่อ (อังกฤษ)",
                  firstNameThai: "ชื่อ (ไทย)",
                  lastNameThai: "นามสกุล (ไทย)",
                  firstNameEnglish: "ชื่อ (อังกฤษ)",
                  lastNameEnglish: "นามสกุล (อังกฤษ)",
                  email: "อีเมล",
                  phone: "เบอร์โทรศัพท์",
                  position: "ตำแหน่ง",
                };
                return fieldMap[key] || key;
              })
              .join(", ");

            repErrorDetails.push(`ผู้แทนคนที่ ${index + 1}: ${fieldNames}`);
            errorCount += Object.keys(repError).length;
          }
        });

        if (repErrorDetails.length > 0) {
          errorMessage = `ข้อมูลผู้แทนไม่ครบถ้วน:\n${repErrorDetails.join("\n")}`;
        }
      }

      // นับ errors อื่นๆ ที่ไม่ใช่ representativeErrors
      const otherErrorCount = Object.keys(errors).filter(
        (key) => key !== "representativeErrors",
      ).length;
      errorCount += otherErrorCount;

      if (!errorMessage) {
        const [firstKey, firstValue] = Object.entries(errors)[0] || [];
        errorMessage =
          typeof firstValue === "string"
            ? firstValue
            : `พบข้อผิดพลาด ${errorCount} รายการ: กรุณากรอกข้อมูลให้ครบถ้วน`;
      } else if (otherErrorCount > 0) {
        errorMessage += `\n\nและข้อผิดพลาดอื่นๆ อีก ${otherErrorCount} รายการ`;
      }

      toast.error(errorMessage, { duration: 7000 });
      return;
    }

    // ตรวจสอบ Tax ID ในขั้นตอนที่ 1 (ตรวจสอบทั้ง OC และ AC)
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
 * คอมโพเนนต์สำหรับแสดงตัวบอกขั้นตอนการกรอกฟอร์ม AC
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
 * @param {Function} props.onSaveDraft ฟังก์ชันเมื่อกดปุ่มบันทึกร่าง
 * @param {boolean} props.isSubmitting สถานะกำลังส่งข้อมูล
 */
export const NavigationButtons = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  onSaveDraft,
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
      <div className="ml-auto flex gap-3">
        {currentStep !== totalSteps && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            บันทึกร่าง
          </button>
        )}
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
