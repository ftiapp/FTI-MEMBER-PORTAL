// AMDraftService.js - Draft save/load/delete for AM membership form

import { useState, useEffect } from "react";

// Service for handling draft operations in AM membership form
export async function saveDraft(draftData) {
  try {
    const response = await fetch("/api/membership/save-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberType: "am",
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

// Delete draft
export const deleteDraft = async () => {
  try {
    const response = await fetch("/api/member/am-membership/draft", {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete draft");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting draft:", error);
    throw error;
  }
};

// Auto-save hook
export const useAutoSave = (formData, userId, enabled = true) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) return;

    const save = async () => {
      setIsSaving(true);
      try {
        await saveDraft(formData);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    };

    const timeout = setTimeout(save, 2000);
    return () => clearTimeout(timeout);
  }, [formData, userId, enabled]);

  return { lastSaved, isSaving };
};
