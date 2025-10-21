/**
 * Shared navigation button components for membership forms
 */

/**
 * Previous button
 */
export const PreviousButton = ({ onClick, disabled = false, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md"
      } ${className}`}
    >
      ← ย้อนกลับ
    </button>
  );
};

/**
 * Next button
 */
export const NextButton = ({ onClick, disabled = false, isSubmitting = false, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-md disabled:bg-gray-400 bg-blue-600 text-white hover:bg-blue-700 ${className}`}
    >
      {isSubmitting ? "กำลังตรวจสอบ..." : "ถัดไป →"}
    </button>
  );
};

/**
 * Save draft button
 */
export const SaveDraftButton = ({ onClick, disabled = false, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
    >
      บันทึกร่าง
    </button>
  );
};

/**
 * Submit button
 */
export const SubmitButton = ({
  onClick,
  disabled = false,
  isSubmitting = false,
  isResubmission = false,
  consentRequired = false,
  consentAgreed = true,
  className = "",
}) => {
  const isDisabled = disabled || isSubmitting || (consentRequired && !consentAgreed);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700 ${className}`}
    >
      {isSubmitting ? "กำลังส่ง..." : isResubmission ? "ยืนยันการส่งใบสมัครใหม่" : "ยืนยันการสมัคร"}
    </button>
  );
};

/**
 * Step counter display
 */
export const StepCounter = ({ currentStep, totalSteps, className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="bg-blue-50 px-4 py-2 rounded-lg">
        <span className="text-lg text-blue-700 font-semibold">
          ขั้นตอนที่ {currentStep} จาก {totalSteps}
        </span>
      </div>
    </div>
  );
};

/**
 * Complete navigation bar with all buttons
 */
export const FormNavigationBar = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
  isSubmitting = false,
  showSaveDraft = false,
  isFinalStep = false,
  isResubmission = false,
  consentRequired = false,
  consentAgreed = true,
  isSinglePageLayout = false,
}) => {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-8 -mx-6 mt-8 shadow-lg">
      <div
        className={`max-w-7xl mx-auto flex ${isSinglePageLayout ? "justify-end" : "justify-between"} items-center`}
      >
        {!isSinglePageLayout && (
          <>
            {/* Previous Button */}
            <PreviousButton onClick={onPrevious} disabled={currentStep === 1} />

            {/* Step Counter */}
            <StepCounter currentStep={currentStep} totalSteps={totalSteps} />
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Save Draft Button - Show on steps 1-3 and not single page */}
          {!isSinglePageLayout && showSaveDraft && onSaveDraft && (
            <SaveDraftButton onClick={onSaveDraft} />
          )}

          {/* Submit Button - Show on final step */}
          {(isFinalStep || isSinglePageLayout) && (
            <SubmitButton
              onClick={onSubmit}
              isSubmitting={isSubmitting}
              isResubmission={isResubmission}
              consentRequired={consentRequired}
              consentAgreed={consentAgreed}
            />
          )}

          {/* Next Button - Show on steps 1-4 in step mode */}
          {!isSinglePageLayout && !isFinalStep && (
            <NextButton onClick={onNext} isSubmitting={isSubmitting} />
          )}
        </div>
      </div>
    </div>
  );
};
