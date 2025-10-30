// Service for handling draft operations in AC membership form
import { toast } from "react-hot-toast";

export async function saveDraft(draftData) {
  // ตรวจสอบว่ามี Tax ID หรือไม่ (AC ใช้ Tax ID)
  if (!draftData.taxId || draftData.taxId.trim() === "") {
    toast.error("กรุณากรอกเลขประจำตัวผู้เสียภาษีก่อนบันทึกร่าง");
    return { success: false, message: "Missing tax ID" };
  }

  // ตรวจสอบความถูกต้องของ Tax ID (13 หลัก)
  if (draftData.taxId.length !== 13 || !/^\d{13}$/.test(draftData.taxId)) {
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
        memberType: "ac",
        draftData: draftData,
        currentStep: draftData.currentStep || 1,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error saving draft:", error);
    toast.error("เกิดข้อผิดพลาดในการบันทึกร่าง");
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

export const deleteDraft = async () => {
  try {
    const response = await fetch("/api/member/oc-membership/draft", {
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
