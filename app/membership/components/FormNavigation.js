"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { scrollToError } from "../utils/validation/index.js";

/**
 * Configuration สำหรับแต่ละประเภทสมาชิก
 */
export const MEMBERSHIP_CONFIGS = {
  IC: {
    steps: [
      { id: 1, name: "ข้อมูลผู้สมัคร", description: "ข้อมูลส่วนตัวและที่อยู่" },
      { id: 2, name: "ข้อมูลผู้แทน", description: "ผู้แทนที่สามารถติดต่อได้" },
      { id: 3, name: "ข้อมูลธุรกิจ", description: "ประเภทธุรกิจและสินค้า/บริการ" },
      { id: 4, name: "เอกสารแนบ", description: "อัพโหลดเอกสารสำคัญ" },
      { id: 5, name: "สรุปข้อมูล", description: "ตรวจสอบข้อมูลก่อนส่ง" },
    ],
    validateIdCard: true,
    validateTaxId: false,
    showSaveDraft: false,
  },
  OC: {
    steps: [
      { id: 1, name: "ข้อมูลบริษัท", description: "ข้อมูลนิติบุคคล" },
      { id: 2, name: "ข้อมูลผู้แทน", description: "ผู้แทนที่สามารถติดต่อได้" },
      { id: 3, name: "ข้อมูลธุรกิจ", description: "ประเภทธุรกิจและสินค้า/บริการ" },
      { id: 4, name: "อัพโหลดเอกสาร", description: "เอกสารประกอบการสมัคร" },
      { id: 5, name: "ยืนยันข้อมูล", description: "ตรวจสอบข้อมูลก่อนส่ง" },
    ],
    validateIdCard: false,
    validateTaxId: true,
    showSaveDraft: false,
  },
  AC: {
    steps: [
      { id: 1, name: "ข้อมูลบริษัท", description: "ข้อมูลนิติบุคคล" },
      { id: 2, name: "ข้อมูลผู้แทน", description: "ผู้แทนที่สามารถติดต่อได้" },
      { id: 3, name: "ข้อมูลธุรกิจ", description: "ประเภทธุรกิจและสินค้า/บริการ" },
      { id: 4, name: "อัพโหลดเอกสาร", description: "เอกสารประกอบการสมัคร" },
      { id: 5, name: "ยืนยันข้อมูล", description: "ตรวจสอบข้อมูลก่อนส่ง" },
    ],
    validateIdCard: false,
    validateTaxId: true,
    showSaveDraft: true,
  },
  AM: {
    steps: [
      { id: 1, name: "ข้อมูลสมาคม", description: "ข้อมูลสมาคม" },
      { id: 2, name: "ข้อมูลผู้แทน", description: "ผู้แทนที่สามารถติดต่อได้" },
      { id: 3, name: "ข้อมูลธุรกิจ", description: "ประเภทธุรกิจและสินค้า/บริการ" },
      { id: 4, name: "อัพโหลดเอกสาร", description: "เอกสารประกอบการสมัคร" },
      { id: 5, name: "ยืนยันข้อมูล", description: "ตรวจสอบข้อมูลก่อนส่ง" },
    ],
    validateIdCard: false,
    validateTaxId: false,
    showSaveDraft: false,
  },
};

/**
 * Hook สำหรับจัดการการนำทางในฟอร์มสมัครสมาชิก (รองรับทุกประเภท)
 * @param {Object} options
 * @param {string} options.membershipType - ประเภทสมาชิก (IC, OC, AC, AM)
 * @param {number} options.currentStep - ขั้นตอนปัจจุบัน
 * @param {Function} options.setCurrentStep - ฟังก์ชันเปลี่ยนขั้นตอน
 * @param {Object} options.formData - ข้อมูลฟอร์ม
 * @param {Object} options.errors - ข้อผิดพลาด
 * @param {number} options.totalSteps - จำนวนขั้นตอนทั้งหมด
 * @param {Function} options.validateCurrentStep - ฟังก์ชันตรวจสอบขั้นตอนปัจจุบัน
 * @param {Function} options.checkIdCardUniqueness - ฟังก์ชันตรวจสอบบัตรประชาชน (สำหรับ IC)
 * @param {Function} options.checkTaxIdUniqueness - ฟังก์ชันตรวจสอบ Tax ID (สำหรับ OC, AC)
 * @returns {Object}
 */
export function useFormNavigation({
  membershipType = "IC",
  currentStep,
  setCurrentStep,
  formData,
  errors,
  totalSteps,
  validateCurrentStep,
  checkIdCardUniqueness,
  checkTaxIdUniqueness,
}) {
  const [isValidating, setIsValidating] = useState(false);
  const config = MEMBERSHIP_CONFIGS[membershipType] || MEMBERSHIP_CONFIGS.IC;

  /**
   * จัดการข้อผิดพลาดและแสดง toast message
   */
  const handleValidationErrors = useCallback((stepErrors) => {
    console.log("Validation errors detected:", stepErrors);

    // Scroll to error with proper section mapping and options
    const sectionMapping = {
      // Company/Applicant info
      companyName: '[data-section="company-info"]',
      companyNameEng: '[data-section="company-info"]',
      taxId: '[data-section="company-info"]',
      idCardNumber: '[data-section="applicant-info"]',

      // Association info (AM)
      associationName: '[data-section="association-info"]',
      associationNameEng: '[data-section="association-info"]',
      associationEmail: '[data-section="association-info"]',
      associationPhone: '[data-section="association-info"]',

      // Address errors
      "addresses.required": '[data-section="address-section"]',
      "addresses.office": '[data-section="address-section"]',
      "addresses.mailing": '[data-section="address-section"]',
      "addresses.tax": '[data-section="address-section"]',
      address: '[data-section="address-section"]', // For address_1_field, address_2_field format
      address_1: '[data-section="address-section"]',
      address_2: '[data-section="address-section"]',
      address_3: '[data-section="address-section"]',
      addressNumber: '[data-section="address-section"]',
      subDistrict: '[data-section="address-section"]',
      district: '[data-section="address-section"]',
      province: '[data-section="address-section"]',
      postalCode: '[data-section="address-section"]',

      // Contact person
      contactPersons: '[data-section="contact-person"]',
      contactPerson0PrenameTh: '[data-section="contact-person"]',
      contactPerson0Email: '[data-section="contact-person"]',

      // Representatives
      representatives: '[data-section="representative-section"]',
      representativeErrors: '[data-section="representative-section"]',

      // Business info
      businessTypes: '[data-section="business-section"]',
      products: '[data-section="business-section"]',
      numberOfEmployees: '[data-section="business-section"]',
      memberCount: '[data-section="business-section"]',
      otherBusinessTypeDetail: '[data-section="business-section"]',

      // Documents
      factoryType: '[data-section="document-section"]',
      documents: '[data-section="document-section"]',
      companyStamp: '[data-section="document-section"]',
      authorizedSignature: '[data-section="document-section"]',
      productionImages: '[data-section="document-section"]',
      associationCertificate: '[data-section="document-section"]',
      memberList: '[data-section="document-section"]',
    };

    scrollToError(stepErrors, sectionMapping, {
      delay: 100,
      behavior: "smooth",
      block: "center",
      focusElement: true,
      preferSection: false,
    });

    // สร้าง error message ที่ละเอียดสำหรับ representatives
    let errorMessage = "";
    let errorCount = 0;

    if (stepErrors.representativeErrors && Array.isArray(stepErrors.representativeErrors)) {
      const repErrors = stepErrors.representativeErrors;
      const repErrorDetails = [];

      repErrors.forEach((repError, index) => {
        if (repError && Object.keys(repError).length > 0) {
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

          const fieldNames = Object.keys(repError)
            .map((key) => fieldMap[key] || key)
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
    const otherErrorCount = Object.keys(stepErrors).filter(
      (key) => key !== "representativeErrors",
    ).length;
    errorCount += otherErrorCount;

    if (!errorMessage) {
      const [firstKey, firstValue] = Object.entries(stepErrors)[0] || [];
      errorMessage =
        typeof firstValue === "string"
          ? firstValue
          : `พบข้อผิดพลาด ${errorCount} รายการ: กรุณากรอกข้อมูลให้ครบถ้วน`;
    } else if (otherErrorCount > 0) {
      errorMessage += `\n\nและข้อผิดพลาดอื่นๆ อีก ${otherErrorCount} รายการ`;
    }

    toast.error(errorMessage, {
      position: "top-right",
      duration: 7000,
    });
  }, []);

  /**
   * ตรวจสอบ ID Card สำหรับ IC
   */
  const validateIdCard = useCallback(
    async (formData) => {
      if (!config.validateIdCard || !checkIdCardUniqueness) return true;

      const idCardValidation = formData._idCardValidation;

      // ถ้ายังตรวจสอบอยู่
      if (idCardValidation?.isChecking) {
        toast.error("กรุณารอให้การตรวจสอบเลขบัตรประชาชนเสร็จสิ้น", {
          position: "top-right",
        });
        return false;
      }

      // ตรวจสอบ isValid
      if (idCardValidation?.isValid === false) {
        toast.error(idCardValidation.message || "เลขบัตรประชาชนนี้ไม่สามารถใช้ได้", {
          position: "top-right",
        });
        return false;
      }

      // ถ้ายังไม่ได้ตรวจสอบ ID Card เลย
      if (!idCardValidation && formData.idCardNumber) {
        try {
          const idCardCheckResult = await checkIdCardUniqueness(formData.idCardNumber);

          if (idCardCheckResult && idCardCheckResult.valid === false) {
            toast.error(idCardCheckResult.message || "เลขบัตรประชาชนนี้ไม่สามารถใช้ได้", {
              position: "top-right",
            });
            return false;
          }
        } catch (error) {
          console.error("Error checking ID card:", error);
          // หากเกิด error ให้ผ่านไป (สำหรับกรณีไม่มีฐานข้อมูล)
        }
      }

      // ตรวจสอบให้แน่ใจว่า ID Card valid
      if (idCardValidation?.isValid !== true && formData.idCardNumber) {
        toast.error("กรุณาตรวจสอบเลขบัตรประชาชนให้ถูกต้อง", {
          position: "top-right",
        });
        return false;
      }

      return true;
    },
    [config.validateIdCard, checkIdCardUniqueness],
  );

  /**
   * ตรวจสอบ Tax ID สำหรับ OC, AC
   */
  const validateTaxId = useCallback(
    async (formData) => {
      if (!config.validateTaxId || !checkTaxIdUniqueness) return true;

      if (formData.taxId && formData.taxId.length === 13) {
        try {
          const isUnique = await checkTaxIdUniqueness(formData.taxId);
          return isUnique;
        } catch (error) {
          console.error("Error checking tax ID:", error);
          return true; // ให้ผ่านไปถ้าเกิด error
        }
      }

      return true;
    },
    [config.validateTaxId, checkTaxIdUniqueness],
  );

  /**
   * ไปยังขั้นตอนถัดไป
   */
  const handleNextStep = useCallback(async () => {
    if (currentStep >= totalSteps) return;

    setIsValidating(true);

    try {
      // Validate current step
      const stepErrors = validateCurrentStep(currentStep, formData);

      if (Object.keys(stepErrors).length > 0) {
        console.log("Validation errors:", stepErrors);
        handleValidationErrors(stepErrors);
        return;
      }

      // ตรวจสอบ ID Card สำหรับ IC (step 1)
      if (currentStep === 1 && config.validateIdCard) {
        const isIdCardValid = await validateIdCard(formData);
        if (!isIdCardValid) return;
      }

      // ตรวจสอบ Tax ID สำหรับ OC, AC (step 1)
      if (currentStep === 1 && config.validateTaxId) {
        const isTaxIdValid = await validateTaxId(formData);
        if (!isTaxIdValid) return;
      }

      // ถ้าผ่านทุกการตรวจสอบแล้ว ให้ไปขั้นตอนต่อไป
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);

      toast.success("ข้อมูลถูกต้อง กำลังไปขั้นตอนต่อไป", {
        position: "top-right",
      });
    } catch (error) {
      console.error("Error in form navigation:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", {
        position: "top-right",
      });
    } finally {
      setIsValidating(false);
    }
  }, [
    currentStep,
    totalSteps,
    formData,
    validateCurrentStep,
    setCurrentStep,
    config,
    validateIdCard,
    validateTaxId,
    handleValidationErrors,
  ]);

  /**
   * ย้อนกลับไปขั้นตอนก่อนหน้า
   */
  const handlePrevStep = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  }, [currentStep, setCurrentStep]);

  /**
   * StepIndicator Component
   */
  const StepIndicator = useMemo(() => {
    const steps = config.steps;

    return function StepIndicator() {
      return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center mb-4 md:mb-0">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === step.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : currentStep > step.id
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>

              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep === step.id
                      ? "text-blue-600"
                      : currentStep > step.id
                        ? "text-green-500"
                        : "text-gray-500"
                  }`}
                >
                  {step.name}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-400 hidden md:block">{step.description}</p>
                )}
              </div>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block w-12 h-0.5 mx-4 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      );
    };
  }, [currentStep, config.steps]);

  /**
   * NavigationButtons Component
   */
  const NavigationButtons = useMemo(() => {
    return function NavigationButtons({ onSubmit, onSaveDraft, isSubmitting }) {
      return (
        <div className="flex justify-between mt-10">
          {/* Back button */}
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || isValidating}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            ย้อนกลับ
          </button>

          {/* Right side buttons */}
          <div className="flex gap-3">
            {/* Save Draft button (สำหรับ AC) */}
            {config.showSaveDraft && currentStep !== totalSteps && onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                บันทึกร่าง
              </button>
            )}

            {/* Next/Submit button */}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isValidating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {isValidating ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังตรวจสอบ...
                  </span>
                ) : (
                  "ถัดไป"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-green-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังส่งข้อมูล...
                  </span>
                ) : (
                  "ยืนยันการสมัคร"
                )}
              </button>
            )}
          </div>
        </div>
      );
    };
  }, [currentStep, totalSteps, handlePrevStep, handleNextStep, isValidating, config.showSaveDraft]);

  return {
    StepIndicator,
    NavigationButtons,
    handleNextStep,
    handlePrevStep,
    isValidating,
  };
}

/**
 * Legacy exports สำหรับ backward compatibility
 */
export const useICFormNavigation = (props) => useFormNavigation({ ...props, membershipType: "IC" });
export const useOCFormNavigation = (validateForm, currentStep, setCurrentStep, totalSteps) => {
  const [internalCurrentStep, setInternalCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actualCurrentStep = currentStep !== undefined ? currentStep : internalCurrentStep;
  const actualSetCurrentStep = setCurrentStep || setInternalCurrentStep;
  const actualTotalSteps = totalSteps || 5;

  return {
    currentStep: actualCurrentStep,
    setCurrentStep: actualSetCurrentStep,
    isSubmitting,
    setIsSubmitting,
    totalSteps: actualTotalSteps,
    handleNextStep: async (formData, setErrors) => {
      const errors = validateForm(formData, actualCurrentStep);
      setErrors(errors);

      if (Object.keys(errors).length > 0) {
        console.log("Legacy OC validation errors:", errors);

        // Scroll to error with proper section mapping
        const sectionMapping = {
          companyName: '[data-section="company-info"]',
          companyNameEng: '[data-section="company-info"]',
          taxId: '[data-section="company-info"]',
          "addresses.required": '[data-section="address-section"]',
          "addresses.office": '[data-section="address-section"]',
          "addresses.mailing": '[data-section="address-section"]',
          "addresses.tax": '[data-section="address-section"]',
          contactPersons: '[data-section="contact-person"]',
          representatives: '[data-section="representative-section"]',
          representativeErrors: '[data-section="representative-section"]',
          businessTypes: '[data-section="business-section"]',
          products: '[data-section="business-section"]',
          factoryType: '[data-section="document-section"]',
          companyStamp: '[data-section="document-section"]',
          authorizedSignature: '[data-section="document-section"]',
        };

        scrollToError(errors, sectionMapping, {
          delay: 100,
          behavior: "smooth",
          block: "center",
          focusElement: true,
          preferSection: false,
        });

        toast.error("กรุณากรอกข้อมูลให้ครบถ้วน", { duration: 7000 });
        return;
      }

      actualSetCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    },
    handlePrevStep: () => {
      actualSetCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    },
  };
};

export const useACFormNavigation = useOCFormNavigation;
export const useAMFormNavigation = (validateForm) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  return {
    currentStep,
    setCurrentStep,
    isSubmitting,
    setIsSubmitting,
    totalSteps,
    handleNextStep: (formData, setErrors) => {
      const formErrors = validateForm(formData, currentStep);
      setErrors(formErrors);

      if (Object.keys(formErrors).length === 0) {
        if (currentStep < totalSteps) {
          setCurrentStep((prev) => prev + 1);
          window.scrollTo(0, 0);
        }
      } else {
        console.log("Legacy AM validation errors:", formErrors);

        // Scroll to error with proper section mapping
        const sectionMapping = {
          associationName: '[data-section="association-info"]',
          associationNameEng: '[data-section="association-info"]',
          "addresses.required": '[data-section="address-section"]',
          "addresses.office": '[data-section="address-section"]',
          "addresses.mailing": '[data-section="address-section"]',
          "addresses.tax": '[data-section="address-section"]',
          contactPersons: '[data-section="contact-person"]',
          representatives: '[data-section="representative-section"]',
          representativeErrors: '[data-section="representative-section"]',
          businessTypes: '[data-section="business-section"]',
          products: '[data-section="business-section"]',
          documents: '[data-section="document-section"]',
        };

        scrollToError(formErrors, sectionMapping, {
          delay: 100,
          behavior: "smooth",
          block: "center",
          focusElement: true,
          preferSection: false,
        });
      }
    },
    handlePrevStep: () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
        window.scrollTo(0, 0);
      }
    },
  };
};

/**
 * Standalone Components สำหรับใช้แยกต่างหาก
 */
export { StepIndicator, NavigationButtons } from "./FormNavigationComponents";
