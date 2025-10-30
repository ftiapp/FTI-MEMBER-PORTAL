import { toast } from "react-hot-toast";
import { FIELD_ERROR_MAP } from "./constants";
import { getFirstErrorKey } from "./scrollHelpers";
import { saveDraftData } from "../../../utils/draftHelpers";

/**
 * Check Tax ID uniqueness
 * @param {string} taxId - Tax ID to check
 * @param {AbortController} abortController - Abort controller for cancellation
 * @returns {Promise<{isUnique: boolean, message: string}>}
 */
export const checkTaxIdUniqueness = async (taxId, abortController) => {
  if (!taxId || taxId.length !== 13) {
    return { isUnique: false, message: "เลขประจำตัวผู้เสียภาษีอากรไม่ถูกต้อง" };
  }

  try {
    const response = await fetch("/api/member/oc-membership/check-tax-id", {
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
      message: data.message || "ไม่สามารถตรวจสอบเลขประจำตัวผู้เสียภาษีอากรได้",
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    console.error("Error checking Tax ID uniqueness:", error);
    return {
      isUnique: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษีอากร",
    };
  }
};

/**
 * Check ID card uniqueness
 * @param {string} idCardNumber - ID card number to check
 * @param {AbortController} abortController - Abort controller for cancellation
 * @returns {Promise<{isUnique: boolean, message: string}>}
 */
export const checkIdCardUniqueness = async (idCardNumber, abortController) => {
  if (!idCardNumber || idCardNumber.length !== 13) {
    return { isUnique: false, message: "เลขบัตรประชาชนไม่ถูกต้อง" };
  }

  try {
    const response = await fetch("/api/member/ic-membership/check-id-card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idCardNumber }),
      signal: abortController?.signal,
    });

    const data = await response.json();
    console.log("ID Card validation response:", data);

    return {
      isUnique: data.valid === true,
      message: data.message || "ไม่สามารถตรวจสอบเลขบัตรประชาชนได้",
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    console.error("Error checking ID card uniqueness:", error);
    return {
      isUnique: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน",
    };
  }
};

/**
 * Handle saving draft for OC membership
 */
export const createHandleSaveDraft = (formData, currentStep) => async () => {
  return await saveDraftData(formData, "oc", currentStep, "taxId");
};

/**
 * Delete draft by Tax ID (OC membership)
 * @param {string} taxId - Tax ID
 * @returns {Promise<void>}
 */
export const deleteDraft = async (taxId) => {
  try {
    const response = await fetch("/api/membership/get-drafts?type=oc");

    if (!response.ok) {
      console.error("Failed to fetch drafts for deletion");
      return;
    }

    const data = await response.json();
    const drafts = Array.isArray(data) ? data : data?.drafts || [];

    const draftToDelete = drafts.find((draft) => {
      const draftTaxId = draft?.draftData?.taxId || draft?.tax_id || draft?.taxId;
      return String(draftTaxId || "") === String(taxId || "");
    });

    if (draftToDelete) {
      const deleteResponse = await fetch("/api/membership/delete-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberType: "oc",
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
 * @param {Function} setFormData - Function to set form data
 * @param {Function} setCurrentStep - Function to set current step
 * @returns {Promise<boolean>} - Success status
 */
export const loadDraftFromUrl = async (setFormData, setCurrentStep) => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get("draft");

    if (!draftId) {
      return false;
    }

    const response = await fetch(`/api/membership/get-draft?id=${draftId}&type=oc`);

    if (!response.ok) {
      console.error("Failed to load draft");
      return false;
    }

    const data = await response.json();

    if (data.success && data.draft) {
      setFormData((prev) => ({ ...prev, ...data.draft.draftData }));
      if (setCurrentStep && data.draft.currentStep) {
        setCurrentStep(data.draft.currentStep);
      }
      toast.success("โหลดข้อมูลร่างสำเร็จ");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error loading draft:", error);
    return false;
  }
};

/**
 * Build representative error message
 * @param {Object} representativeErrors - Representative errors object
 * @returns {string} - Error message
 */
export const buildRepresentativeErrorMessage = (representativeErrors) => {
  if (!representativeErrors || typeof representativeErrors !== "object") {
    return "กรุณากรอกข้อมูลผู้แทนให้ครบถ้วน";
  }

  const fieldNames = Object.keys(representativeErrors)
    .map((key) => {
      // Map error keys to Thai field names
      const fieldNameMap = {
        prenameTh: "คำนำหน้าชื่อ (ไทย)",
        prename_th: "คำนำหน้าชื่อ (ไทย)",
        prenameEn: "คำนำหน้าชื่อ (อังกฤษ)",
        prename_en: "คำนำหน้าชื่อ (อังกฤษ)",
        firstNameThai: "ชื่อ (ไทย)",
        lastNameThai: "นามสกุล (ไทย)",
        firstNameEng: "ชื่อ (อังกฤษ)",
        lastNameEng: "นามสกุล (อังกฤษ)",
        email: "อีเมล",
        phone: "เบอร์โทรศัพท์",
      };
      return fieldNameMap[key] || FIELD_ERROR_MAP[key] || key;
    })
    .join(", ");

  return `ข้อมูลผู้แทนไม่ครบถ้วน: ${fieldNames}`;
};

/**
 * Build error toast message (Compatible with OC style - single param)
 * @param {Object} formErrors - Form errors object
 * @returns {string} - Error message
 */
export const buildErrorToastMessage = (formErrors) => {
  // Get first error key
  const firstErrorKey = getFirstErrorKey(formErrors);

  if (!firstErrorKey) {
    return "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง";
  }

  // Handle representative errors
  if (firstErrorKey === "representativeErrors" && formErrors.representativeErrors) {
    return buildRepresentativeErrorMessage(formErrors.representativeErrors);
  }

  // Handle address errors
  if (firstErrorKey.startsWith("address_")) {
    const match = firstErrorKey.match(/address_(\d+)_(.*)$/);
    if (match) {
      const addressType = match[1];
      const field = match[2];
      const addressLabels = {
        1: "ที่อยู่สำนักงาน",
        2: "ที่อยู่จัดส่งเอกสาร",
        3: "ที่อยู่ใบกำกับภาษี",
      };
      const label = addressLabels[addressType] || `ที่อยู่ประเภท ${addressType}`;
      const fieldName = FIELD_ERROR_MAP[field] || field;
      return `กรุณากรอก${fieldName} (${label})`;
    }
  }

  // Handle product errors
  if (firstErrorKey === "products" || firstErrorKey === "productErrors") {
    return "กรุณากรอกข้อมูลสินค้า/บริการให้ครบถ้วน";
  }

  // Handle regular errors
  const errorValue = formErrors[firstErrorKey];
  if (typeof errorValue === "string") {
    return errorValue;
  }

  // Use field map for better messages
  const fieldName = FIELD_ERROR_MAP[firstErrorKey];
  if (fieldName) {
    return `กรุณากรอก${fieldName}`;
  }

  // Default message with error count
  const errorCount = Object.keys(formErrors).length;
  return `พบข้อผิดพลาด ${errorCount} รายการ กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน`;
};
