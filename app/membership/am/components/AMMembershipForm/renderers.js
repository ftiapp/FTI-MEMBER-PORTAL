// AMMembershipForm_Renderers.js
// Rendering functions for form components

import React from "react";
import AssociationInfoSection from "../AssociationInfoSection";
import RepresentativeInfoSection from "../../../components/RepresentativeInfoSection";
import BusinessInfoSection from "../BusinessInfoSection";
import DocumentsSection from "../DocumentUploadSection";
import SummarySection from "../SummarySection";

/**
 * Render current step component
 * @param {Object} params - Render parameters
 * @returns {React.Component|null} - Step component
 */
export const renderStepComponent = ({
  currentStep,
  formData,
  setFormData,
  errors,
  setErrors,
  taxIdValidating,
  businessTypes,
  industrialGroups,
  provincialChapters,
  showErrors,
}) => {
  const commonProps = { formData, setFormData, errors };

  const stepComponents = {
    1: (
      <AssociationInfoSection
        {...commonProps}
        setErrors={setErrors}
        taxIdValidating={taxIdValidating}
      />
    ),
    2: (
      <RepresentativeInfoSection
        mode="multiple"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        config={{
          headerTitle: "ข้อมูลผู้แทนสมาคม",
          headerSubtitle: "ข้อมูลผู้มีอำนาจลงนามแทนสมาคม",
          positionPlaceholder: "ประธาน, รองประธาน, เลขานุการ...",
          toastId: "am-representative-errors",
        }}
      />
    ),
    3: <BusinessInfoSection {...commonProps} businessTypes={businessTypes} />,
    4: <DocumentsSection {...commonProps} />,
    5: (
      <SummarySection
        formData={formData}
        businessTypes={businessTypes}
        industrialGroups={industrialGroups}
        provincialChapters={provincialChapters}
      />
    ),
  };

  return stepComponents[currentStep] || null;
};

/**
 * Render navigation buttons
 * @param {Object} params - Button parameters
 * @returns {React.Component} - Navigation buttons
 */
export const renderNavigationButtons = ({
  currentStep,
  effectiveTotalSteps,
  handlePrevious,
  handleNext,
  handleSubmit,
  handleSaveDraft,
  isSubmitting,
  consentAgreed,
  disableSaveDraft,
  submitLabel,
}) => {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-8 -mx-6 mt-8 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
            currentStep === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md"
          }`}
        >
          ← ย้อนกลับ
        </button>

        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-lg text-blue-700 font-semibold">
              ขั้นตอนที่ {currentStep} จาก {effectiveTotalSteps}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Save Draft Button - Show on steps 1-3 (hidden on step 4) unless disabled */}
          {!disableSaveDraft && currentStep < 5 && currentStep !== 4 && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
            >
              บันทึกร่าง
            </button>
          )}

          {/* Next Button - Show on steps 1-4 */}
          {currentStep < 5 && (
            <button
              type="button"
              onClick={handleNext}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
            >
              ถัดไป →
            </button>
          )}

          {/* Submit Button - Show only on the last step (5) */}
          {currentStep === 5 && (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !consentAgreed}
              className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                isSubmitting || !consentAgreed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-md"
              } text-white`}
            >
              {isSubmitting ? "⏳ กำลังส่ง..." : submitLabel || "✓ ยืนยันการสมัคร"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Render document preparation hint
 * @param {number} currentStep - Current step
 * @returns {React.Component|null} - Hint component
 */
export const renderDocumentHint = (currentStep) => {
  if (currentStep !== 1) return null;

  return (
    <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-700 text-base">
        <strong>รายการเอกสารที่ท่านต้องเตรียม:</strong> หนังสือรับรองสมาคม และทะเบียนภาษีมูลค่าเพิ่ม
        (ภ.พ.20)
      </p>
    </div>
  );
};

/**
 * Render error message helper
 * @param {*} errorValue - Error value
 * @param {string} key - Error key
 * @param {number} index - Error index
 * @returns {React.Component} - Error message component
 */
export const renderErrorMessage = (errorValue, key, index) => {
  if (typeof errorValue === "object" && errorValue !== null) {
    // Handle nested error objects
    const firstErrorKey = Object.keys(errorValue)[0];
    const message =
      firstErrorKey === "_error" ? errorValue._error : `${key}: ${errorValue[firstErrorKey]}`;
    return (
      <li key={`${key}-${index}`} className="text-base">
        {message}
      </li>
    );
  }
  return (
    <li key={`${key}-${index}`} className="text-base">
      {errorValue}
    </li>
  );
};
