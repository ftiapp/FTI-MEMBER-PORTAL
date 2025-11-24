// ICMembershipForm_Renderers.js
// Render functions for IC Form

import ApplicantInfoSection from "../ApplicantInfoSection";
import RepresentativeInfoSection from "../../../components/RepresentativeInfoSection";
import BusinessInfoSection from "../BusinessInfoSection";
import DocumentUploadSection from "../DocumentUploadSection";
import SummarySection from "../SummarySection";

/**
 * Render step component based on current step
 * @param {Object} props - Component props
 * @returns {JSX.Element|null}
 */
export const renderStepComponent = ({
  currentStep,
  formData,
  setFormData,
  errors,
  setErrors,
  idCardValidating,
  businessTypes,
  industrialGroups,
  provincialChapters,
  showErrors,
  isEditMode,
}) => {
  const commonProps = { formData, setFormData, errors };

  const stepComponents = {
    1: (
      <ApplicantInfoSection
        {...commonProps}
        setErrors={setErrors}
        industrialGroups={industrialGroups}
        provincialChapters={provincialChapters}
        idCardValidating={idCardValidating}
        isEditMode={isEditMode}
      />
    ),
    2: (
      <RepresentativeInfoSection
        mode="single"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        config={{
          headerTitle: "ข้อมูลผู้แทน",
          headerSubtitle: "ข้อมูลผู้ที่สามารถติดต่อได้",
          positionPlaceholder: "",
          infoMessage: "กรอกข้อมูลผู้แทนที่สามารถติดต่อได้",
          toastId: "ic-representative-errors",
          fieldNames: {
            firstNameTh: "firstNameThai",
            lastNameTh: "lastNameThai",
            firstNameEn: "firstNameEng",
            lastNameEn: "lastNameEng",
          },
        }}
      />
    ),
    3: (
      <BusinessInfoSection
        {...commonProps}
        businessTypes={businessTypes}
        industrialGroups={industrialGroups}
        provincialChapters={provincialChapters}
      />
    ),
    4: <DocumentUploadSection {...commonProps} showErrors={showErrors} />,
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
 * @param {Object} props - Button props
 * @returns {JSX.Element}
 */
export const renderNavigationButtons = ({
  currentStep,
  totalSteps,
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
  const steps = effectiveTotalSteps || totalSteps || 5;

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-8 -mx-6 mt-8 shadow-lg z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Previous Button */}
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

        {/* Step Counter */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-lg text-blue-700 font-semibold">
              ขั้นตอนที่ {currentStep} จาก {steps}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Save Draft Button - Show on steps 1, 2, 3 (can be disabled via flag) */}
          {!disableSaveDraft && currentStep < 4 && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
            >
              บันทึกร่าง
            </button>
          )}

          {/* Next Button - Show on steps 1, 2, 3, 4 */}
          {currentStep < steps && (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 hover:shadow-md disabled:bg-gray-400"
            >
              ถัดไป →
            </button>
          )}

          {/* Submit Button - Show only on the last step */}
          {currentStep === steps && (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !consentAgreed}
              className="px-10 py-4 bg-green-600 text-white rounded-xl font-semibold text-base hover:bg-green-700 transition-all duration-200 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังส่ง..." : submitLabel || "ยืนยันการสมัคร"}
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
 * @returns {JSX.Element|null}
 */
export const renderDocumentHint = (currentStep) => {
  if (currentStep !== 1) return null;

  return (
    <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-700 text-base">
        <strong>รายการเอกสารที่ท่านต้องเตรียม:</strong> สำเนาบัตรประชาชน
      </p>
    </div>
  );
};

/**
 * Render error message helper
 * @param {any} errorValue - Error value
 * @param {string} key - Error key
 * @param {number} index - Index
 * @returns {JSX.Element}
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
