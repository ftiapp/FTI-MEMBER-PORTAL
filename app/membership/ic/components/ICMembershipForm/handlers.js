// ICMembershipForm_Handlers.js
// Handler functions for IC Form

import { toast } from "react-hot-toast";

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
 * Save draft
 * @param {Object} formData - Form data to save
 * @param {number} currentStep - Current step
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const saveDraft = async (formData, currentStep) => {
  // ตรวจสอบว่ามี ID Card หรือไม่
  if (!formData.idCardNumber || formData.idCardNumber.trim() === "") {
    toast.error("กรุณากรอกเลขบัตรประชาชนก่อนบันทึกร่าง");
    return { success: false, message: "Missing ID card number" };
  }

  // ตรวจสอบความถูกต้องของ ID Card (13 หลัก)
  if (formData.idCardNumber.length !== 13 || !/^\d{13}$/.test(formData.idCardNumber)) {
    toast.error("เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก");
    return { success: false, message: "Invalid ID card format" };
  }

  try {
    const response = await fetch("/api/membership/save-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberType: "ic",
        draftData: formData,
        currentStep: currentStep,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true };
    } else {
      return { success: false, message: result.message || "กรุณาลองใหม่" };
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error("เกิดข้อผิดพลาดในการบันทึกร่าง");
    return { success: false, message: "Error saving draft" };
  }
};

/**
 * Delete draft by ID card number
 * @param {string} idCardNumber - ID card number
 * @returns {Promise<void>}
 */
export const deleteDraft = async (idCardNumber) => {
  try {
    // ดึง draft ของ user เพื่อหา draft ที่ตรงกับ ID card
    const response = await fetch("/api/membership/get-drafts?type=ic");

    if (!response.ok) {
      console.error("Failed to fetch drafts for deletion");
      return;
    }

    const data = await response.json();
    const drafts = Array.isArray(data) ? data : data?.drafts || [];

    // หา draft ที่ตรงกับ ID card ของผู้สมัคร
    const draftToDelete = drafts.find((draft) => {
      const draftIdCard = draft?.draftData?.idCardNumber || draft?.id_card_number || draft?.idCardNumber;
      return String(draftIdCard || "") === String(idCardNumber || "");
    });

    if (draftToDelete) {
      const deleteResponse = await fetch("/api/membership/delete-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberType: "ic",
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

    const response = await fetch(`/api/membership/get-draft?id=${draftId}&type=ic`);

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
  if (!representativeErrors || typeof representativeErrors !== 'object') {
    return "กรุณากรอกข้อมูลผู้แทนให้ครบถ้วน";
  }

  const fieldMap = {
    'prenameTh': 'คำนำหน้าชื่อ (ไทย)',
    'prenameEn': 'คำนำหน้าชื่อ (อังกฤษ)',
    'firstNameThai': 'ชื่อ (ไทย)',
    'lastNameThai': 'นามสกุล (ไทย)',
    'firstNameEng': 'ชื่อ (อังกฤษ)',
    'lastNameEng': 'นามสกุล (อังกฤษ)',
    'email': 'อีเมล',
    'phone': 'เบอร์โทรศัพท์',
  };

  const fieldNames = Object.keys(representativeErrors)
    .map(key => fieldMap[key] || key)
    .join(', ');

  return `ข้อมูลผู้แทนไม่ครบถ้วน: ${fieldNames}`;
};

/**
 * Build error toast message
 * @param {Object} formErrors - Form errors object
 * @param {string} firstErrorKey - First error key
 * @returns {string} - Error message
 */
export const buildErrorToastMessage = (formErrors, firstErrorKey) => {
  if (firstErrorKey === "representativeErrors" && formErrors.representativeErrors) {
    return buildRepresentativeErrorMessage(formErrors.representativeErrors);
  }

  const firstErrorValue = formErrors[firstErrorKey];
  if (typeof firstErrorValue === "string") {
    return firstErrorValue;
  }

  const errorCount = Object.keys(formErrors).length;
  return `พบข้อผิดพลาด ${errorCount} รายการ: กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน`;
};
