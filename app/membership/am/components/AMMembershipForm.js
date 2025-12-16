"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";
import { useRouter } from "next/navigation";
import MembershipSuccessModal from "@/app/components/MembershipSuccessModal";
import DraftSavePopup from "../../components/DraftSavePopup";
import OCResubmissionCommentBox from "@/app/membership/oc/components/OCMembershipForm/OCResubmissionCommentBox";

// Import shared components
import { FormDataLoader } from "../../components/FormLoadingStates";
import { FormErrorBox } from "../../components/FormErrorDisplay";
import { ConsentCheckbox } from "../../utils/consentHelpers";

// Import form modules
import { validateAMForm } from "./AMFormValidation";
import { submitAMMembershipForm } from "./AMFormSubmission";
import { useAMFormNavigation } from "./AMFormNavigation";
import { useApiData } from "../../hooks/useApiData";

// Import extracted modules from AMMembershipForm folder
import {
  STEPS,
  INITIAL_FORM_DATA,
  STICKY_HEADER_OFFSET,
  getFirstFieldError,
  createScrollToErrorField,
  scrollToTop,
  scrollToConsentBox,
  checkTaxIdUniqueness,
  saveDraft,
  deleteDraft,
  loadDraftFromUrl,
  buildRepresentativeErrorMessage,
  buildErrorToastMessage,
  renderStepComponent,
  renderNavigationButtons,
  renderDocumentHint,
  renderErrorMessage,
} from "./AMMembershipForm/index";

export default function AMMembershipForm(props = {}) {
  const router = useRouter();
  const abortControllerRef = useRef(null);

  // Create scroll function with offset
  const scrollToErrorField = useCallback(createScrollToErrorField(STICKY_HEADER_OFFSET), []);

  // State management
  const [internalFormData, setInternalFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [taxIdValidating, setTaxIdValidating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showDraftSavePopup, setShowDraftSavePopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Determine which form data and setters to use
  const isExternal = props.formData !== undefined;
  const formData = isExternal ? props.formData : internalFormData;
  const setFormData = isExternal ? props.setFormData : setInternalFormData;

  // Get showErrors from props or use internal state
  const showErrors = props.showErrors !== undefined ? props.showErrors : false;
  const setShowErrors = props.setShowErrors || (() => {});

  // Sync externalFormData with internal state when it changes
  useEffect(() => {
    if (isExternal && props.formData && Object.keys(props.formData).length > 0) {
      console.log("AM FORM: External form data received, updating internal state.", props.formData);
      setInternalFormData((prevData) => ({ ...prevData, ...props.formData }));
    }
  }, [props.formData, isExternal]);

  const {
    businessTypes,
    industrialGroups,
    provincialChapters,
    isLoading,
    error: apiError,
  } = useApiData();

  const {
    currentStep: hookCurrentStep,
    isSubmitting,
    setIsSubmitting,
    totalSteps,
    handleNextStep,
    handlePrevStep,
    setCurrentStep: setHookCurrentStep,
  } = useAMFormNavigation((formData, step) => validateAMForm(formData, step));

  // Effective step control (prefer parent-controlled if provided)
  const currentStep = props.currentStep ?? hookCurrentStep;
  const setCurrentStep = props.setCurrentStep ?? setHookCurrentStep;
  const effectiveTotalSteps = props.totalSteps ?? totalSteps ?? 5;

  // Debug logging
  if (process.env.NODE_ENV !== "production") {
    console.log("🎛️ AMMembershipForm Props:", {
      hasFormDataProp: !!props.formData,
      hasSetFormDataProp: !!props.setFormData,
      hasCurrentStepProp: !!props.currentStep,
      hasSetCurrentStepProp: !!props.setCurrentStep,
      hasShowErrorsProp: !!props.showErrors,
      hasSetShowErrorsProp: !!props.setShowErrors,
      formDataKeys: props.formData ? Object.keys(props.formData) : "none",
      currentStepValue: currentStep,
      totalStepsValue: effectiveTotalSteps,
      showErrorsValue: showErrors,
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load draft data on mount
  useEffect(() => {
    const loadDraft = async () => {
      setIsLoadingDraft(true);
      const success = await loadDraftFromUrl(setFormData, setCurrentStep);
      setIsLoadingDraft(false);
    };
    loadDraft();
  }, []);

  // Wrapped checkTaxIdUniqueness with abort controller
  const checkTaxId = useCallback(async (taxId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setTaxIdValidating(true);
    const result = await checkTaxIdUniqueness(taxId, abortControllerRef.current);
    setTaxIdValidating(false);
    return result;
  }, []);

  // Handle form submission - only for final step (step 5)
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      // Only allow submit on final step
      if (currentStep !== 5) {
        console.log("AM Form submit prevented - not on final step");
        return;
      }

      // Re-validate all fields before final submission
      const formErrors = validateAMForm(formData, STEPS.length);
      setErrors(formErrors);

      if (Object.keys(formErrors).length > 0) {
        console.log("❌ Validation errors:", formErrors);

        if (typeof setShowErrors === "function") {
          setShowErrors(true);
        }

        // Build error message
        const firstErrorKey = getFirstFieldError(formErrors) || "representativeErrors";
        const errorMessage = buildErrorToastMessage(formErrors, firstErrorKey);

        // Find first error step
        const firstErrorStep = STEPS.find(
          (step) => Object.keys(validateAMForm(formData, step.id)).length > 0,
        );

        // Navigate to the step with the error
        if (firstErrorStep && setCurrentStep) {
          setCurrentStep(firstErrorStep.id);

          setTimeout(() => {
            if (firstErrorKey === "representativeErrors") {
              scrollToErrorField("representativeErrors");
            } else {
              scrollToErrorField(firstErrorKey);
            }
          }, 100);
        }

        toast.error(errorMessage, { duration: 7000 });
        return;
      }

      // Check consent
      if (!consentAgreed) {
        toast.error("กรุณายอมรับข้อตกลงการคุ้มครองข้อมูลส่วนบุคคลก่อนยืนยันการสมัคร", {
          duration: 4000,
        });
        scrollToConsentBox();
        return;
      }

      // Submit form
      setIsSubmitting(true);

      try {
        let result;

        if (props.onSubmitOverride && typeof props.onSubmitOverride === "function") {
          // Use override handler (e.g. edit mode update)
          result = await props.onSubmitOverride(formData);
        } else {
          // Default: create new application
          result = await submitAMMembershipForm(formData);
        }

        if (result.success) {
          await deleteDraft(formData.taxId);
          setSubmissionResult(result);
          setShowSuccessModal(true);
          setIsSubmitting(false);
        } else {
          setIsSubmitting(false);
          toast.error(result.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        }
      } catch (error) {
        console.error("Submission error:", error);
        setIsSubmitting(false);
        toast.error("เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่อีกครั้ง");
      }
    },
    [formData, currentStep, router, setCurrentStep, consentAgreed, props.onSubmitOverride],
  );

  // Handle next step
  const handleNext = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      console.log("🔵 AM handleNext - Step:", currentStep);
      const formErrors = validateAMForm(formData, currentStep);
      console.log("🔵 AM handleNext - Validation errors:", formErrors);
      setErrors(formErrors);

      if (Object.keys(formErrors).length > 0) {
        if (typeof setShowErrors === "function") {
          setShowErrors(true);
        }

        // Let child components handle specific errors
        if (currentStep === 2 && formErrors.representativeErrors) {
          console.log("⏭️ AM handleNext - Step 2 representative errors, letting child handle");
          return;
        }

        if (
          currentStep === 3 &&
          (formErrors.businessTypes ||
            formErrors.otherBusinessTypeDetail ||
            formErrors.memberCount ||
            formErrors.numberOfEmployees ||
            formErrors.products ||
            formErrors.productErrors)
        ) {
          console.log("⏭️ AM handleNext - Step 3 business errors, letting child handle");
          return;
        }

        // Handle other errors
        const firstErrorKey =
          getFirstFieldError(formErrors) ||
          (formErrors.representativeErrors ? "representativeErrors" : null);

        if (firstErrorKey) {
          scrollToErrorField(firstErrorKey);
        }

        const errorMessage =
          typeof formErrors[firstErrorKey] === "string"
            ? formErrors[firstErrorKey]
            : "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง";

        toast.error(errorMessage);
        return;
      }

      // Special check for Tax ID on step 1
      if (currentStep === 1 && formData.taxId?.length === 13) {
        const taxIdResult = await checkTaxId(formData.taxId);
        if (!taxIdResult.isUnique) {
          setErrors((prev) => ({ ...prev, taxId: taxIdResult.message }));
          toast.error(taxIdResult.message);
          return;
        }
      }

      if (props.currentStep !== undefined && typeof setCurrentStep === "function") {
        setCurrentStep(currentStep + 1);
      } else {
        handleNextStep(formData, setErrors);
      }

      scrollToTop();
    },
    [formData, currentStep, checkTaxId, handleNextStep, props.currentStep, setCurrentStep],
  );

  const handlePrevious = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (props.currentStep !== undefined && typeof setCurrentStep === "function") {
        setCurrentStep(Math.max(1, currentStep - 1));
      } else {
        handlePrevStep();
      }
    },
    [handlePrevStep, props.currentStep, setCurrentStep, currentStep],
  );

  const handleSaveDraft = useCallback(async () => {
    const result = await saveDraft(formData, currentStep);
    if (result.success) {
      setShowDraftSavePopup(true);
    } else if (
      result.message &&
      result.message !== "Missing tax ID" &&
      result.message !== "Invalid tax ID format"
    ) {
      toast.error(`ไม่สามารถบันทึกร่างได้: ${result.message}`);
    }
  }, [formData, currentStep]);

  // Render current step component
  const currentStepComponent = useMemo(() => {
    return renderStepComponent({
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
    });
  }, [
    currentStep,
    formData,
    errors,
    businessTypes,
    industrialGroups,
    provincialChapters,
    taxIdValidating,
    showErrors,
  ]);

  // Show loading state
  if (isLoading || isLoadingDraft) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  // Show API error
  if (apiError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{apiError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-6 py-8">
      <LoadingOverlay isVisible={isSubmitting} message="กำลังส่งข้อมูล..." />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Messages */}
        <FormErrorBox errors={errors} excludeKeys={["representativeErrors"]} />

        {/* Form Content */}
        <div className="bg-white rounded-xl p-10 shadow-lg border border-gray-100">
          {currentStepComponent}
        </div>

        {/* Consent Checkbox - Show only on the last step */}
        {currentStep === 5 && (
          <ConsentCheckbox consentAgreed={consentAgreed} setConsentAgreed={setConsentAgreed} />
        )}

        {/* กล่องระบุรายละเอียดการแก้ไขข้อมูล - ใช้ในโหมดแก้ไขข้อมูล (edit-v4) */}
        {currentStep === 5 && props.isEditMode && (
          <OCResubmissionCommentBox
            value={formData.userResubmissionComment}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                userResubmissionComment: val,
              }))
            }
          />
        )}

        {/* Navigation Buttons */}
        {renderNavigationButtons({
          currentStep,
          effectiveTotalSteps,
          handlePrevious,
          handleNext,
          handleSubmit,
          handleSaveDraft,
          isSubmitting,
          consentAgreed,
          disableSaveDraft: props.disableSaveDraft,
          submitLabel: props.isEditMode ? "ยืนยันการแก้ไขข้อมูล" : undefined,
        })}

        {/* Document preparation hint */}
        {renderDocumentHint(currentStep)}
      </form>

      {/* Draft Save Popup */}
      <DraftSavePopup
        isOpen={showDraftSavePopup}
        onClose={() => setShowDraftSavePopup(false)}
        membershipType="AM"
        displayInfo={{
          primaryId: formData.taxId,
          primaryName: formData.associationName,
          primaryIdLabel: "เลขประจำตัวผู้เสียภาษี",
        }}
      />

      {/* Success Modal */}
      <MembershipSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        membershipType="am"
        memberData={{
          taxId: formData.taxId,
          companyNameTh: formData.associationName,
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push("/dashboard?tab=documents");
        }}
      />
    </div>
  );
}
