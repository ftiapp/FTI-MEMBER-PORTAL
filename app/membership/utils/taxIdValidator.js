/**
 * Shared utilities for Tax ID validation
 * Used by AC, OC, AM membership forms
 */

/**
 * Check if Tax ID is unique (not already registered)
 * @param {string} taxId - Tax ID to check
 * @param {string} memberType - Member type (ac, oc, am)
 * @param {object} abortSignal - Optional abort signal for cancellation
 * @returns {Promise<object>} - { isUnique: boolean, message: string }
 */
export const checkTaxIdUniqueness = async (taxId, memberType, abortSignal = null) => {
  if (!taxId || taxId.length !== 13) {
    return { isUnique: false, message: "เลขประจำตัวผู้เสียภาษีไม่ถูกต้อง" };
  }

  if (!["ac", "oc", "am"].includes(memberType)) {
    return { isUnique: false, message: "ประเภทสมาชิกไม่ถูกต้อง" };
  }

  try {
    const response = await fetch(`/api/member/${memberType}-membership/check-tax-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taxId }),
      signal: abortSignal,
    });

    const result = await response.json();

    // Handle error responses
    if (!response.ok) {
      if (response.status === 409) {
        return {
          isUnique: false,
          message: result.error || result.message || "เลขประจำตัวผู้เสียภาษีซ้ำ",
        };
      }
      return {
        isUnique: false,
        message: result.error || result.message || "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
      };
    }

    return {
      isUnique: result.valid === true,
      message:
        result.message ||
        (result.valid ? "เลขประจำตัวผู้เสียภาษีสามารถใช้ได้" : "ไม่สามารถตรวจสอบได้"),
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw error; // Re-throw abort errors
    }
    console.error("Error checking tax ID uniqueness:", error);
    return {
      isUnique: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบเลขประจำตัวผู้เสียภาษี",
    };
  }
};

/**
 * Validate Tax ID format (13 digits)
 * @param {string} taxId - Tax ID to validate
 * @returns {boolean} - True if valid format
 */
export const isValidTaxIdFormat = (taxId) => {
  return taxId && taxId.length === 13 && /^\d{13}$/.test(taxId);
};

/**
 * Format Tax ID for display (e.g., 1234567890123 -> 1-2345-67890-12-3)
 * @param {string} taxId - Tax ID to format
 * @returns {string} - Formatted Tax ID
 */
export const formatTaxId = (taxId) => {
  if (!taxId || taxId.length !== 13) return taxId;
  return `${taxId.slice(0, 1)}-${taxId.slice(1, 5)}-${taxId.slice(5, 10)}-${taxId.slice(10, 12)}-${taxId.slice(12, 13)}`;
};
