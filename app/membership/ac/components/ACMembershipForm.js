"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-hot-toast";
import LoadingOverlay from "@/app/dashboard/components/shared/LoadingOverlay";
import { useRouter } from "next/navigation";
import MembershipSuccessModal from "@/app/components/MembershipSuccessModal";

// Import components
import CompanyInfoSection from "./CompanyInfoSection";
import RepresentativeInfoSection from "../../components/RepresentativeInfoSection";
import BusinessInfoSection from "./BusinessInfoSection";
import DocumentsSection from "./DocumentUploadSection";
import SummarySection from "./SummarySection";
import DraftSavePopup from "../../components/DraftSavePopup";

// Import shared components
import { FormDataLoader } from "../../components/FormLoadingStates";
import { FormErrorBox } from "../../components/FormErrorDisplay";
import { ConsentCheckbox } from "../../utils/consentHelpers";

// Import utilities
import { validateACForm } from "./ACFormValidation";
import { useACFormNavigation } from "./ACFormNavigation";
import { saveDraft } from "./ACDraftService";

// Import shared hooks and utilities
import { useApiData } from "../../hooks/useApiData";
import { deleteDraftByTaxId, loadDraftFromUrl } from "../../utils/draftHelpers";

// Import from ACMembershipForm folder
import {
  STEPS,
  INITIAL_FORM_DATA,
  scrollToErrorField,
  getFirstFieldError,
  createHandleSaveDraft,
  createValidateTaxId,
  createHandleSubmit,
  createHandlePrevious,
  createRenderFormContent,
  renderErrorMessage,
} from "./ACMembershipForm/index";

// Using shared useApiData hook (removed local implementation)

export default function ACMembershipForm({
  formData: externalFormData,
  setFormData: externalSetFormData,
  currentStep: externalCurrentStep,
  setCurrentStep: externalSetCurrentStep,
  totalSteps: externalTotalSteps,
  rejectionId, // เพิ่ม rejectionId สำหรับโหมดแก้ไข
  userComment, // เพิ่ม comment จากผู้ใช้
  isSinglePageLayout = false, // เพิ่ม prop สำหรับ layout หน้าเดียว
}) {
  const router = useRouter();
  const abortControllerRef = useRef(null);
  const stickyOffsetRef = useRef(120); // Approx header/toolbar height to offset when scrolling

  // Use external form data if provided, otherwise use internal state
  const [internalFormData, setInternalFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [taxIdValidating, setTaxIdValidating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showDraftSavePopup, setShowDraftSavePopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Determine which form data and setters to use
  const isExternal = externalFormData !== undefined;
  const formData = isExternal ? externalFormData : internalFormData;
  const setFormData = isExternal ? externalSetFormData : setInternalFormData;

  // When external data is provided, ensure the form uses it directly.
  // This is crucial for the 'edit-rejected' feature.
  useEffect(() => {
    if (isExternal && externalFormData && Object.keys(externalFormData).length > 0) {
      console.log("AC FORM: External form data received, using it directly.", externalFormData);
      // Directly use the external data. The `formData` variable is already aliased to `externalFormData`.
      // We might clear errors from previous states if necessary.
      setErrors({});
    } else if (!isExternal) {
      // Logic for non-external data, e.g., loading draft
    }
  }, [externalFormData, isExternal]);

  const {
    businessTypes,
    industrialGroups,
    provincialChapters,
    isLoading,
    error: apiError,
  } = useApiData();

  // Use external navigation if provided, otherwise use internal hook
  const internalNavigation = useACFormNavigation(
    (formData, step) => validateACForm(formData, step),
    externalCurrentStep,
    externalSetCurrentStep,
    externalTotalSteps,
  );

  const currentStep = externalCurrentStep || internalNavigation.currentStep;
  const setCurrentStep = externalSetCurrentStep || internalNavigation.setCurrentStep;
  const totalSteps = externalTotalSteps || internalNavigation.totalSteps;
  const isSubmitting = internalNavigation.isSubmitting;
  const setIsSubmitting = internalNavigation.setIsSubmitting;
  const handleNextStep = internalNavigation.handleNextStep;
  const handlePrevStep = internalNavigation.handlePrevStep;

  // Debug: เพิ่ม console.log เพื่อตรวจสอบค่า
  console.log("AC Current Step:", currentStep);
  console.log("AC Total Steps:", totalSteps);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load draft data on mount - only if not using external form data
  useEffect(() => {
    // Skip draft loading if external form data is provided (e.g., from edit-rejected page)
    if (externalFormData) {
      console.log("🔄 AC Form: Using external form data, skipping draft load");
      return;
    }

    const loadDraftData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get("draftId");

      if (draftId) {
        setIsLoadingDraft(true);
        try {
          const response = await fetch(`/api/membership/get-drafts?type=ac`);
          const data = await response.json();

          if (data.success && data.drafts && data.drafts.length > 0) {
            const draft = data.drafts.find((d) => d.id === parseInt(draftId));
            if (draft && draft.draftData) {
              // Merge draft data with initial form data
              setFormData((prev) => ({ ...prev, ...draft.draftData }));
              // ถ้า navigation hook รองรับการตั้งค่า currentStep
              if (setCurrentStep && draft.currentStep) {
                setCurrentStep(draft.currentStep);
              }
              toast.success("โหลดข้อมูลร่างสำเร็จ");
            }
          }
        } catch (error) {
          console.error("Error loading draft:", error);
          toast.error("ไม่สามารถโหลดข้อมูลร่างได้");
        } finally {
          setIsLoadingDraft(false);
        }
      }
    };

    loadDraftData();
  }, [externalFormData]); // Add externalFormData as dependency

  const handleSaveDraft = useCallback(async () => {
    const result = await createHandleSaveDraft(formData, currentStep)();
    if (result.success) {
      setShowDraftSavePopup(true);
    }
  }, [formData, currentStep]);

  // Using shared deleteDraftByTaxId utility (removed local implementation)

  // Check tax ID uniqueness using shared utility
  const validateTaxId = useCallback(
    createValidateTaxId(abortControllerRef, setTaxIdValidating),
    [],
  );

  // Legacy wrapper for compatibility
  const checkTaxIdUniqueness_legacy = validateTaxId;

  // Helper to extract the first specific field error (imported from ACMembershipForm folder)

  // Handle form submission and step navigation
  const handleSubmit = useCallback(
    createHandleSubmit({
      formData,
      currentStep,
      totalSteps,
      isSinglePageLayout,
      setErrors,
      setIsSubmitting,
      setCurrentStep,
      validateTaxId,
      scrollToErrorField,
      consentAgreed,
      rejectionId,
      userComment,
      industrialGroups,
      provincialChapters,
      setSubmissionResult,
      setShowSuccessModal,
      router,
    }),
    [
      formData,
      currentStep,
      totalSteps,
      isSinglePageLayout,
      validateTaxId,
      scrollToErrorField,
      consentAgreed,
      rejectionId,
      userComment,
      industrialGroups,
      provincialChapters,
      router,
    ],
  );

  const handlePrevious = useCallback(createHandlePrevious(handlePrevStep), [handlePrevStep]);

  // Render form content based on layout
  const renderFormContent = createRenderFormContent({
    isSinglePageLayout,
    currentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    taxIdValidating,
    businessTypes,
    industrialGroups,
    provincialChapters,
    isLoading,
  });

  // Render error message helper (imported from ACMembershipForm folder)

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
        {/* Error Messages - Using shared component */}
        <FormErrorBox errors={errors} excludeKeys={["representativeErrors"]} />

        {/* Form Content */}
        <div className="bg-white rounded-xl p-10 shadow-lg border border-gray-100">
          {renderFormContent()}
        </div>

        {/* Consent Checkbox - Show only on the last step - Using shared component */}
        {(currentStep === 5 || isSinglePageLayout) && (
          <ConsentCheckbox consentAgreed={consentAgreed} setConsentAgreed={setConsentAgreed} />
        )}

        {/* Navigation Buttons - Fixed positioning */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-8 -mx-6 mt-8 shadow-lg">
          <div
            className={`max-w-7xl mx-auto flex ${isSinglePageLayout ? "justify-end" : "justify-between"} items-center`}
          >
            {!isSinglePageLayout && (
              <>
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
                      ขั้นตอนที่ {currentStep} จาก {totalSteps}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Save Draft Button - Show on steps 1, 2, 3 and not single page */}
              {!isSinglePageLayout && currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-10 py-4 bg-yellow-500 text-white rounded-xl font-semibold text-base hover:bg-yellow-600 transition-all duration-200 hover:shadow-md"
                >
                  บันทึกร่าง
                </button>
              )}

              {/* Submit Button - Show on final step */}
              {(currentStep === 5 || isSinglePageLayout) && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !consentAgreed}
                  className="px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700"
                >
                  {isSubmitting
                    ? "กำลังส่ง..."
                    : rejectionId
                      ? "ยืนยันการส่งใบสมัครใหม่"
                      : "ยืนยันการสมัคร"}
                </button>
              )}

              {/* Next Button - Show on steps 1-4 in step mode */}
              {!isSinglePageLayout && currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-md disabled:bg-gray-400 bg-blue-600 text-white hover:bg-blue-700"
                >
                  ถัดไป →
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Draft Save Popup */}
      <DraftSavePopup
        isOpen={showDraftSavePopup}
        onClose={() => setShowDraftSavePopup(false)}
        membershipType="AC"
        displayInfo={{
          primaryId: formData.taxId,
          primaryName: formData.companyName,
          primaryIdLabel: "หมายเลขทะเบียนนิติบุคคล",
        }}
      />

      {/* Success Modal */}
      <MembershipSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        membershipType="ac"
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
