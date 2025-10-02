// Service for handling draft operations in OC membership form
export async function saveDraft(draftData) {
  try {
    const response = await fetch("/api/membership/save-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberType: "oc",
        draftData: draftData,
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
