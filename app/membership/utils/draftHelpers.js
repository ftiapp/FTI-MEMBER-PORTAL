import { toast } from "react-hot-toast";

/**
 * Filter out file-related fields from formData to prevent saving file objects in drafts
 * Files cannot be properly restored from drafts, so we exclude them entirely
 * @param {object} formData - The complete form data
 * @returns {object} - Form data with file fields removed
 */
export const filterFileFieldsForDraft = (formData) => {
  if (!formData || typeof formData !== "object") {
    return formData;
  }

  // Create a copy of formData to avoid mutating the original
  const filteredData = { ...formData };

  // List of file-related fields to exclude from draft saving
  const fileFieldsToExclude = [
    "companyRegistration",
    "vatRegistration",
    "idCard",
    "authorityLetter",
    "companyStamp",
    "authorizedSignature",
    "authorizedSignatures", // Array of signature files
    // Add any other file fields that might exist
  ];

  // Remove file fields
  fileFieldsToExclude.forEach((field) => {
    if (filteredData.hasOwnProperty(field)) {
      delete filteredData[field];
    }
  });

  return filteredData;
};

/**
 * Delete a draft by tax ID
 * @param {string} taxId - Tax ID to search for
 * @param {string} memberType - Member type (ac, oc, ic, am)
 * @returns {Promise<boolean>} - Success status
 */
export const deleteDraftByTaxId = async (taxId, memberType) => {
  if (!taxId || !memberType) return false;

  try {
    // Fetch drafts to find the one matching the tax ID
    const response = await fetch(`/api/membership/get-drafts?type=${memberType}`);

    if (!response.ok) {
      console.error("Failed to fetch drafts for deletion");
      return false;
    }

    const draftsData = await response.json();
    const drafts = draftsData?.success ? draftsData.drafts || [] : [];

    // Find draft matching the tax ID
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
          memberType,
          draftId: draftToDelete.id,
        }),
      });

      const deleteResult = await deleteResponse.json();

      if (deleteResult.success) {
        console.log("Draft deleted successfully");
        return true;
      } else {
        console.error("Failed to delete draft:", deleteResult.message);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error("Error deleting draft:", error);
    return false;
  }
};

/**
 * Save draft data
 * @param {object} formData - Form data to save
 * @param {string} memberType - Member type (ac, oc, ic, am)
 * @param {number} currentStep - Current step number
 * @param {string} requiredIdField - Field name for required ID (e.g., 'taxId', 'idCardNumber')
 * @returns {Promise<object>} - Result object with success status
 */
export const saveDraftData = async (
  formData,
  memberType,
  currentStep,
  requiredIdField = "taxId",
) => {
  // Validate required ID field
  const idValue = formData[requiredIdField];

  if (!idValue || String(idValue).trim() === "") {
    const fieldLabels = {
      taxId: "เลขประจำตัวผู้เสียภาษี",
      idCardNumber: "เลขบัตรประชาชน",
    };
    const label = fieldLabels[requiredIdField] || "ข้อมูลระบุตัวตน";
    toast.error(`กรุณากรอก${label}ก่อนบันทึกร่าง`);
    return { success: false, message: "Missing required ID" };
  }

  // Validate ID format (13 digits for Thai IDs)
  if (requiredIdField === "taxId" || requiredIdField === "idCardNumber") {
    if (String(idValue).length !== 13 || !/^\d{13}$/.test(String(idValue))) {
      const fieldLabels = {
        taxId: "เลขประจำตัวผู้เสียภาษี",
        idCardNumber: "เลขบัตรประชาชน",
      };
      const label = fieldLabels[requiredIdField] || "ข้อมูล";
      toast.error(`${label}ต้องเป็นตัวเลข 13 หลัก`);
      return { success: false, message: "Invalid ID format" };
    }
  }

  try {
    // Filter out file fields before saving draft
    const filteredFormData = filterFileFieldsForDraft(formData);

    const response = await fetch("/api/membership/save-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberType,
        draftData: filteredFormData,
        currentStep,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: result };
    } else {
      toast.error(`ไม่สามารถบันทึกร่างได้: ${result.message || "กรุณาลองใหม่"}`);
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error("เกิดข้อผิดพลาดในการบันทึกร่าง");
    return { success: false, message: error.message };
  }
};

/**
 * Load draft data from URL parameter
 * @param {string} memberType - Member type (ac, oc, ic, am)
 * @returns {Promise<object|null>} - Draft data or null
 */
export const loadDraftFromUrl = async (memberType) => {
  const urlParams = new URLSearchParams(window.location.search);
  const draftId = urlParams.get("draftId");

  if (!draftId) return null;

  try {
    const response = await fetch(`/api/membership/get-drafts?type=${memberType}`);
    const data = await response.json();

    if (data.success && data.drafts && data.drafts.length > 0) {
      const draft = data.drafts.find((d) => d.id === parseInt(draftId));
      if (draft && draft.draftData) {
        toast.success("โหลดข้อมูลร่างสำเร็จ");
        return {
          draftData: draft.draftData,
          currentStep: draft.currentStep,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error loading draft:", error);
    toast.error("ไม่สามารถโหลดข้อมูลร่างได้");
    return null;
  }
};
