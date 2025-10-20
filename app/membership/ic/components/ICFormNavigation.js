"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";

export function useICFormNavigation(validateForm) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const totalSteps = 5;

  const handleNextStep = useCallback(async () => {
    if (currentStep >= totalSteps) return;
    setIsValidating(true);
    try {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error in form navigation:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", {
        position: "top-right",
      });
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, totalSteps, setCurrentStep]);

  // Handle previous step
  const handlePrevStep = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  }, [currentStep, setCurrentStep]);

  // Step indicator component
  const StepIndicator = useMemo(() => {
    // Define the steps for the form
    const steps = [
      { id: 1, name: "ข้อมูลผู้สมัคร", description: "ข้อมูลส่วนตัวและที่อยู่" },
      { id: 2, name: "ข้อมูลผู้แทน", description: "ผู้แทนที่สามารถติดต่อได้" },
      { id: 3, name: "ข้อมูลธุรกิจ", description: "ประเภทธุรกิจและสินค้า/บริการ" },
      { id: 4, name: "เอกสารแนบ", description: "อัพโหลดเอกสารสำคัญ" },
      { id: 5, name: "สรุปข้อมูล", description: "ตรวจสอบข้อมูลก่อนส่ง" },
    ];

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
  }, [currentStep]);

  // Navigation buttons component
  const NavigationButtons = useMemo(() => {
    return function NavigationButtons({ onSubmit, isSubmitting }) {
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
      );
    };
  }, [currentStep, totalSteps, handlePrevStep, handleNextStep, isValidating]);

  return {
    currentStep,
    setCurrentStep,
    totalSteps,
    isSubmitting,
    setIsSubmitting,
    handleNextStep,
    handlePrevStep,
    isValidating,
    StepIndicator,
    NavigationButtons,
  };
}
