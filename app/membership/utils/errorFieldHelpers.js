/**
 * Shared utilities for finding and scrolling to error fields
 * Used by all membership forms (AC, OC, IC, AM)
 */

/**
 * Get the first error field key with priority
 * This is a base implementation that can be customized per form type
 *
 * @param {object} errors - Error object from validation
 * @param {object} options - Configuration options
 * @param {string[]} options.companyPriority - Priority order for company/organization fields
 * @param {string[]} options.addressFieldPriority - Priority order for address fields
 * @param {string[]} options.businessPriority - Priority order for business fields
 * @param {string[]} options.documentPriority - Priority order for document fields
 * @returns {string|null} - First error field key or null
 */
export const getFirstFieldError = (errors = {}, options = {}) => {
  if (!errors || typeof errors !== "object") return null;

  const {
    companyPriority = [],
    addressFieldPriority = ["addressNumber", "subDistrict", "district", "province", "postalCode"],
    businessPriority = ["businessTypes", "otherBusinessTypeDetail", "products"],
    documentPriority = ["authorizedSignature"],
  } = options;

  // 1) Company/Organization info priority
  for (const key of companyPriority) {
    if (errors[key]) return key;
  }

  // 2) Address fields by type and field priority
  const addressTypes = ["1", "2", "3"];
  for (const type of addressTypes) {
    const missingKey = `address_${type}`;
    if (errors[missingKey]) return missingKey;
    for (const f of addressFieldPriority) {
      const k = `address_${type}_${f}`;
      if (errors[k]) return k;
    }
  }

  // 3) Business info
  for (const key of businessPriority) {
    if (errors[key]) return key;
  }
  if (errors.productErrors) return "products";

  // 4) Documents
  for (const key of documentPriority) {
    if (errors[key]) return key;
  }

  // 5) Representative errors (section-level)
  if (errors.representative || errors.representativeErrors) {
    return "representativeErrors";
  }

  // 6) Fallback: stable alphabetical key
  const keys = Object.keys(errors).filter((k) => k !== "representativeErrors");
  if (keys.length > 0) {
    return keys.sort()[0];
  }

  return null;
};

/**
 * Scroll to an error field with smooth behavior
 * @param {string} fieldKey - Field key to scroll to
 * @param {object} options - Scroll options
 * @param {number} options.delay - Delay before scrolling (ms)
 * @param {string} options.behavior - Scroll behavior ('smooth' or 'auto')
 * @param {string} options.block - Vertical alignment ('start', 'center', 'end')
 */
export const scrollToErrorField = (fieldKey, options = {}) => {
  if (!fieldKey || typeof document === "undefined") return;

  const { delay = 100, behavior = "smooth", block = "center" } = options;

  setTimeout(() => {
    // Try multiple selector strategies
    const selectors = [
      `#${fieldKey}`,
      `[name="${fieldKey}"]`,
      `[data-field="${fieldKey}"]`,
      `input[id="${fieldKey}"]`,
      `input[name="${fieldKey}"]`,
      `select[id="${fieldKey}"]`,
      `select[name="${fieldKey}"]`,
      `textarea[id="${fieldKey}"]`,
      `textarea[name="${fieldKey}"]`,
    ];

    let element = null;
    for (const selector of selectors) {
      try {
        element = document.querySelector(selector);
        if (element) break;
      } catch (e) {
        // Invalid selector, continue
      }
    }

    if (element) {
      try {
        element.scrollIntoView({ behavior, block });
        // Focus after scrolling completes
        setTimeout(() => {
          try {
            element.focus({ preventScroll: true });
          } catch (e) {
            // Element not focusable
          }
        }, 100);
      } catch (e) {
        console.error("Error scrolling to field:", e);
      }
    } else {
      // Fallback: try to find section by data-section attribute
      const sectionMap = {
        companyName: "company-info",
        associationName: "association-info",
        idCardNumber: "applicant-info",
        businessTypes: "business-info",
        products: "products",
        documents: "documents",
        representativeErrors: "representatives",
      };

      for (const [key, sectionName] of Object.entries(sectionMap)) {
        if (fieldKey.startsWith(key) || fieldKey === key) {
          const section = document.querySelector(`[data-section="${sectionName}"]`);
          if (section) {
            section.scrollIntoView({ behavior, block: "start" });
            return;
          }
        }
      }
    }
  }, delay);
};

/**
 * Get error message from nested error object
 * @param {any} errorValue - Error value (string or object)
 * @param {string} key - Error key
 * @returns {string} - Error message
 */
export const getErrorMessage = (errorValue, key = "") => {
  if (typeof errorValue === "string") {
    return errorValue;
  }

  if (errorValue && typeof errorValue === "object") {
    // Check for _error summary key
    if (typeof errorValue._error === "string") {
      return errorValue._error;
    }

    // Find first string value in nested object
    for (const [k, v] of Object.entries(errorValue)) {
      if (typeof v === "string") {
        return key === "addresses" ? v : `${k}: ${v}`;
      }
      if (v && typeof v === "object") {
        const nested = getErrorMessage(v, k);
        if (nested) return nested;
      }
    }

    return key ? `${key}: เกิดข้อผิดพลาด` : "เกิดข้อผิดพลาด";
  }

  return "เกิดข้อผิดพลาด";
};

/**
 * Count total errors in nested error object
 * @param {object} errors - Error object
 * @param {string[]} excludeKeys - Keys to exclude from count
 * @returns {number} - Total error count
 */
export const countErrors = (errors = {}, excludeKeys = ["representativeErrors"]) => {
  if (!errors || typeof errors !== "object") return 0;

  let count = 0;

  for (const [key, value] of Object.entries(errors)) {
    if (excludeKeys.includes(key)) continue;

    if (typeof value === "string") {
      count++;
    } else if (Array.isArray(value)) {
      // Count errors in array (e.g., representativeErrors)
      count += value.filter(
        (item) => item && typeof item === "object" && Object.keys(item).length > 0,
      ).length;
    } else if (value && typeof value === "object") {
      // Count nested errors
      count += countErrors(value, []);
    }
  }

  return count;
};
