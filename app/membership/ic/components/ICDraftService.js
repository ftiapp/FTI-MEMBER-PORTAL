// ICDraftService.js - Draft save/load/delete for IC membership form

import { useState, useEffect } from "react";

/**
 * Filter out file-related fields from formData to prevent saving file objects in drafts
 * Files cannot be properly restored from drafts, so we exclude them entirely
 */
const filterFileFieldsForDraft = (formData) => {
  if (!formData || typeof formData !== 'object') {
    return formData;
  }

  // Create a copy of formData to avoid mutating the original
  const filteredData = { ...formData };

  // List of file-related fields to exclude from draft saving
  const fileFieldsToExclude = [
    'companyRegistration',
    'vatRegistration',
    'idCard',
    'authorityLetter',
    'companyStamp',
    'authorizedSignature',
    'authorizedSignatures', // Array of signature files
  ];

  // Remove file fields
  fileFieldsToExclude.forEach(field => {
    if (filteredData.hasOwnProperty(field)) {
      delete filteredData[field];
    }
  });

  return filteredData;
};

// Service for handling draft operations in IC membership form
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
        memberType: "ic",
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

// Delete draft
export const deleteDraft = async () => {
  try {
    const response = await fetch("/api/membership/delete-draft", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberType: "ic" }),
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
