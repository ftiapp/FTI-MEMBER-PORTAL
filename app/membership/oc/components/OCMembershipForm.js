"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";
import { useRouter } from "next/navigation";
import MembershipSuccessModal from "@/app/components/MembershipSuccessModal";
import DraftSavePopup from "../../components/DraftSavePopup";

// Import shared components
import { FormDataLoader } from "../../components/FormLoadingStates";
import { FormErrorBox } from "../../components/FormErrorDisplay";
import { ConsentCheckbox } from "../../utils/consentHelpers";

// Import form modules
import { validateOCForm } from "./OCFormValidation";
import { submitOCMembershipForm } from "./OCFormSubmission";
import { useOCFormNavigation } from "./OCFormNavigation";
import { useApiData } from "../../hooks/useApiData";

// Import extracted modules from OCMembershipForm folder
import {
  STEPS,
  INITIAL_FORM_DATA,
  scrollToErrorField,
  scrollToTop,
  scrollToConsentBox,
  getFirstErrorKey,
  checkTaxIdUniqueness,
  createHandleSaveDraft,
  saveDraft,
  deleteDraft,
  loadDraftFromUrl,
  buildRepresentativeErrorMessage,
  buildErrorToastMessage,
  renderStepComponent,
  renderNavigationButtons,
  renderDocumentHint,
  renderErrorMessage,
} from "./OCMembershipForm/index";

export default function OCMembershipForm(props = {}) {
  const router = useRouter();
  const abortControllerRef = useRef(null);

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
      console.log("OC FORM: External form data received, updating internal state.", props.formData);
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
  } = useOCFormNavigation((formData, step) => validateOCForm(formData, step));

  // Effective step control (prefer parent-controlled if provided)
  const currentStep = props.currentStep ?? hookCurrentStep;
  const setCurrentStep = props.setCurrentStep ?? setHookCurrentStep;
  const effectiveTotalSteps = props.totalSteps ?? totalSteps ?? 5;

  // Debug logging
  console.log("🎛️ OCMembershipForm Props:", {
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
  const checkTaxId = useCallback(
    async (taxId) => {
      // Skip Tax ID uniqueness check in rejected edit mode
      if (props.isRejectedMode) {
        console.log("⏭️ Skipping Tax ID uniqueness check in rejected edit mode");
        return { isUnique: true, message: "" };
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setTaxIdValidating(true);
      const result = await checkTaxIdUniqueness(taxId, abortControllerRef.current);
      setTaxIdValidating(false);
      return result;
    },
    [props.isRejectedMode],
  );

  // Handle form submission - only for final step (step 5)
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      // Only allow submit on final step
      if (currentStep !== 5) {
        console.log("OC Form submit prevented - not on final step");
        return;
      }

      // Re-validate all fields before final submission
      const allErrors = {};
      STEPS.forEach((step) => {
        const stepErrors = validateOCForm(formData, step.id);
        Object.assign(allErrors, stepErrors);
      });

      console.log("🔍 Final submission validation - All errors:", allErrors);
      setErrors(allErrors);

      if (Object.keys(allErrors).length > 0) {
        console.log("❌ Validation errors:", allErrors);

        if (typeof setShowErrors === "function") {
          setShowErrors(true);
        }

        // Build error message
        const firstErrorKey = getFirstErrorKey(allErrors) || "representativeErrors";
        const errorMessage = buildErrorToastMessage(allErrors, firstErrorKey);

        // Find first error step
        const firstErrorStep = STEPS.find(
          (step) => Object.keys(validateOCForm(formData, step.id)).length > 0,
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
        const result = await submitOCMembershipForm(formData);

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
    [formData, currentStep, router, setCurrentStep, consentAgreed],
  );

  // Handle next step
  const handleNext = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const formErrors = validateOCForm(formData, currentStep);
      console.log("🔍 OC Form validation errors for step", currentStep, ":", formErrors);
      setErrors(formErrors);

      if (Object.keys(formErrors).length > 0) {
        if (typeof setShowErrors === "function") {
          setShowErrors(true);
        }

        // Let child components handle specific errors
        if (currentStep === 2 && formErrors.representativeErrors) {
          return;
        }

        if (
          currentStep === 3 &&
          (formErrors.businessTypes || formErrors.otherBusinessTypeDetail || formErrors.products)
        ) {
          return;
        }

        // Handle other errors
        const firstErrorKey =
          getFirstErrorKey(formErrors) ||
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
        console.log("🔵 OC: Checking Tax ID for:", formData.taxId);
        const taxIdResult = await checkTaxId(formData.taxId);
        console.log("🔍 OC: Tax ID result:", taxIdResult);

        if (!taxIdResult.isUnique) {
          console.log("❌ OC: Tax ID NOT valid");
          setErrors((prev) => ({ ...prev, taxId: taxIdResult.message }));
          toast.error(taxIdResult.message);
          return;
        }

        console.log("✅ OC: Tax ID is valid, proceeding to next step");
      } else if (currentStep === 1) {
        console.log("⚠️ OC: Step 1 but tax ID is missing or not 13 digits:", formData.taxId);
      }

      console.log("✅ OC: All validations passed, moving to step", currentStep + 1);
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

  const handleSaveDraft = useCallback(createHandleSaveDraft(formData, currentStep), [
    formData,
    currentStep,
  ]);

  // Wrapper to handle popup
  const handleSaveDraftWithPopup = useCallback(async () => {
    const result = await handleSaveDraft();
    if (result.success) {
      setShowDraftSavePopup(true);
    } else if (
      result.message &&
      result.message !== "Missing tax ID" &&
      result.message !== "Invalid tax ID format"
    ) {
      toast.error(`ไม่สามารถบันทึกร่างได้: ${result.message}`);
    }
  }, [handleSaveDraft]);

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

        {/* Navigation Buttons */}
        {renderNavigationButtons({
          currentStep,
          effectiveTotalSteps,
          handlePrevious,
          handleNext,
          handleSubmit,
          handleSaveDraft: handleSaveDraftWithPopup,
          isSubmitting,
          consentAgreed,
        })}

        {/* Document preparation hint */}
        {renderDocumentHint(currentStep)}
      </form>

      {/* Draft Save Popup */}
      <DraftSavePopup
        isOpen={showDraftSavePopup}
        onClose={() => setShowDraftSavePopup(false)}
        membershipType="OC"
        displayInfo={{
          primaryId: formData.taxId,
          primaryName: formData.companyName,
          primaryIdLabel: "เลขประจำตัวผู้เสียภาษี",
        }}
      />

      {/* Success Modal */}
      <MembershipSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        membershipType="oc"
        memberData={{
          taxId: formData.taxId,
          companyNameTh: formData.companyName,
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push("/dashboard?tab=documents");
        }}
      />
    </div>
  );
}
