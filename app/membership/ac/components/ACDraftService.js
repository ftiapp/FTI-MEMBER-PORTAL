// Service for handling draft operations in AC membership form
export async function saveDraft(draftData) {
  try {
    const response = await fetch('/api/membership/save-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memberType: 'ac',
        draftData: draftData,
        currentStep: draftData.currentStep || 1
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
}

export async function loadDraft(draftId) {
  try {
    const response = await fetch(`/api/membership/get-drafts?draftId=${draftId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error loading draft:', error);
    throw error;
  }
}

export const deleteDraft = async () => {
  try {
    const response = await fetch('/api/member/oc-membership/draft', {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete draft');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};
