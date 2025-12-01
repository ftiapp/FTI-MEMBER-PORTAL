// Service for handling draft operations in OC membership form

/**
 * Filter out file-related fields from formData to prevent saving file objects in drafts
 * Files cannot be properly restored from drafts, so we exclude them entirely
 */
const filterFileFieldsForDraft = (formData) => {
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
  ];

  // Remove file fields
  fileFieldsToExclude.forEach((field) => {
    if (filteredData.hasOwnProperty(field)) {
      delete filteredData[field];
    }
  });

  return filteredData;
};

export async function saveDraft(draftData) {
  try {
    // Filter out file fields before saving draft
    const filteredDraftData = filterFileFieldsForDraft(draftData);

    const response = await fetch("/api/membership/save-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberType: "oc",
        draftData: filteredDraftData,
        currentStep: draftData.currentStep || 1,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error saving draft:", error);
    throw error;
  }
}

export async function loadDraft(draftId) {
  try {
    const response = await fetch(`/api/membership/get-drafts?draftId=${draftId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error loading draft:", error);
    throw error;
  }
}
