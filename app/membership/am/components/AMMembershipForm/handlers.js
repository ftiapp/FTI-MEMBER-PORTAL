// AMMembershipForm_Handlers.js
// Form handlers and business logic

import { toast } from "react-hot-toast";
import { FIELD_ERROR_MAP } from "./constants";

/**
 * Check tax ID uniqueness
 * @param {string} taxId - Tax ID to check
 * @param {AbortController} abortController - Abort controller for request
 * @returns {Promise<{isUnique: boolean, message: string}>}
 */
export const checkTaxIdUniqueness = async (taxId, abortController) => {
  if (!taxId || taxId.length !== 13) {
    return { isUnique: false, message: "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง" };
  }

  try {
    const response = await fetch("/api/member/am-membership/check-tax-id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taxId }),
      signal: abortController?.signal,
    });

    const data = await response.json();
    console.log("Tax ID validation response:", data);

    return {
      isUnique: data.valid === true,
      message: data.message || "ไม่สามารถตรวจสอบเลขประจำตัวผู้เสียภาษีได้",
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return { isUnique: false, message: "การตรวจสอบถูกยกเลิก" };
    }

    console.error("Error checking tax ID uniqueness:", error);
    return {
      isUnique: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี",
    };
  }
};

/**
 * Save draft
 * @param {Object} formData - Form data to save
 * @param {number} currentStep - Current step
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const saveDraft = async (formData, currentStep) => {
  // ตรวจสอบว่ามี Tax ID หรือไม่
  if (!formData.taxId || formData.taxId.trim() === "") {
    toast.error("กรุณากรอกเลขประจำตัวผู้เสียภาษีก่อนบันทึกร่าง");
    return { success: false, message: "Missing tax ID" };
  }

  // ตรวจสอบความถูกต้องของ Tax ID (13 หลัก)
  if (formData.taxId.length !== 13 || !/^\d{13}$/.test(formData.taxId)) {
    toast.error("เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก");
    return { success: false, message: "Invalid tax ID format" };
  }

  try {
    const response = await fetch("/api/membership/save-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberType: "am",
        draftData: formData,
        currentStep: currentStep,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error("เกิดข้อผิดพลาดในการบันทึกร่าง");
    return { success: false, message: error.message };
  }
};

/**
 * Delete draft
 * @param {string} taxId - Tax ID of draft to delete
 * @returns {Promise<void>}
 */
export const deleteDraft = async (taxId) => {
  try {
    // ดึง draft ของ user เพื่อหา draft ที่ตรงกับ tax ID
    const response = await fetch("/api/membership/get-drafts?type=am");

    if (!response.ok) {
      console.error("Failed to fetch drafts for deletion");
      return;
    }

    const data = await response.json();
    const drafts = data?.success ? data.drafts || [] : [];

    const normalize = (v) => String(v ?? "").replace(/\D/g, "");
    const targetTax = normalize(taxId);
    const draftToDelete = drafts.find((draft) => normalize(draft.draftData?.taxId) === targetTax);

    if (draftToDelete) {
      const deleteResponse = await fetch("/api/membership/delete-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberType: "am",
          draftId: draftToDelete.id,
        }),
      });

      const deleteResult = await deleteResponse.json();

      if (deleteResult.success) {
        console.log("Draft deleted successfully");
      } else {
        console.error("Failed to delete draft:", deleteResult.message);
      }
    }
  } catch (error) {
    console.error("Error deleting draft:", error);
  }
};

/**
 * Load draft from URL
 * @param {Function} setFormData - Set form data function
 * @param {Function} setCurrentStep - Set current step function
 * @returns {Promise<boolean>} - Success status
 */
export const loadDraftFromUrl = async (setFormData, setCurrentStep) => {
  const urlParams = new URLSearchParams(window.location.search);
  const draftId = urlParams.get("draftId");

  if (!draftId) return false;

  try {
    const response = await fetch(`/api/membership/get-drafts?type=am`);
    const data = await response.json();

    if (data.success && data.drafts && data.drafts.length > 0) {
      const draft = data.drafts.find((d) => d.id === parseInt(draftId));
      if (draft && draft.draftData) {
        // Merge draft data with form data
        setFormData((prev) => ({ ...prev, ...draft.draftData }));
        // Set current step if available
        if (setCurrentStep && draft.currentStep) {
          setCurrentStep(draft.currentStep);
        }
        toast.success("โหลดข้อมูลร่างสำเร็จ");
        return true;
      }
    }
  } catch (error) {
    console.error("Error loading draft:", error);
    toast.error("ไม่สามารถโหลดข้อมูลร่างได้");
  }
  return false;
};

/**
 * Build representative error message
 * @param {Array} representativeErrors - Array of representative errors
 * @returns {Object} - {message: string, count: number}
 */
export const buildRepresentativeErrorMessage = (representativeErrors) => {
  if (!representativeErrors || !Array.isArray(representativeErrors)) {
    return { message: "", count: 0 };
  }

  const repErrorDetails = [];
  let errorCount = 0;

  representativeErrors.forEach((repError, index) => {
    if (repError && Object.keys(repError).length > 0) {
      const fieldNames = Object.keys(repError).map(key => {
        return FIELD_ERROR_MAP[key] || key;
      }).join(', ');
      
      repErrorDetails.push(`ผู้แทนคนที่ ${index + 1}: ${fieldNames}`);
      errorCount += Object.keys(repError).length;
    }
  });

  if (repErrorDetails.length > 0) {
    return {
      message: `ข้อมูลผู้แทนไม่ครบถ้วน:\n${repErrorDetails.join('\n')}`,
      count: errorCount
    };
  }

  return { message: "", count: 0 };
};

/**
 * Build error toast message
 * @param {Object} errors - Error object
 * @param {string} firstErrorKey - First error key
 * @returns {string} - Error message
 */
export const buildErrorToastMessage = (errors, firstErrorKey) => {
  const repErrorResult = buildRepresentativeErrorMessage(errors.representativeErrors);
  const otherErrorCount = Object.keys(errors).filter(key => key !== 'representativeErrors').length;
  const totalErrorCount = repErrorResult.count + otherErrorCount;

  let errorMessage = repErrorResult.message;

  if (!errorMessage) {
    errorMessage = typeof errors[firstErrorKey] === "string"
      ? errors[firstErrorKey]
      : `พบข้อผิดพลาด ${totalErrorCount} รายการ: กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน`;
  } else if (otherErrorCount > 0) {
    errorMessage += `\n\nและข้อผิดพลาดอื่นๆ อีก ${otherErrorCount} รายการ`;
  }

  return errorMessage;
};