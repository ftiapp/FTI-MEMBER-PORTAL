/**
 * Representative Validation Utilities
 * Centralized validation logic for representative information
 */

/**
 * Normalize string for comparison (trim and lowercase)
 */
export const normalizeString = (str = "") => str.trim().toLowerCase();

/**
 * Validate Thai language input
 */
export const isValidThai = (value) => {
  if (!value || value.trim() === "") return true;
  const thaiPattern = /^[ก-๙\s\.]*$/;
  return thaiPattern.test(value);
};

/**
 * Validate English language input
 */
export const isValidEnglish = (value) => {
  if (!value || value.trim() === "") return true;
  const engPattern = /^[a-zA-Z\s\.]*$/;
  return engPattern.test(value);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email || email.trim() === "") return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

/**
 * Validate phone number (9-10 digits)
 */
export const isValidPhone = (phone) => {
  if (!phone || phone.trim() === "") return false;
  // Remove spaces and hyphens for validation
  const cleanPhone = phone.replace(/[-\s]/g, "");
  // Check if it's 9-10 digits only
  return /^\d{9,10}$/.test(cleanPhone);
};

/**
 * Sanitize phone input (allow only digits, spaces, and hyphens)
 */
export const sanitizePhone = (value) => {
  return value.replace(/[^\d\s-]/g, "");
};

/**
 * Sanitize Thai input (allow only Thai characters, spaces, and dots)
 */
export const sanitizeThai = (value) => {
  return value.replace(/[^ก-๙\.\s]/g, "");
};

/**
 * Sanitize English input (allow only English characters, spaces, and dots)
 */
export const sanitizeEnglish = (value) => {
  return value.replace(/[^a-zA-Z\.\s]/g, "");
};

/**
 * Check for duplicate representatives by name
 * @param {Array} representatives - Array of representative objects
 * @returns {Array} Array of error objects for each representative
 */
export const checkDuplicateNames = (representatives) => {
  const norm = normalizeString;
  const thMap = new Map();
  const enMap = new Map();

  // Build maps of Thai and English names
  representatives.forEach((rep, idx) => {
    // Thai names
    const thFirst = norm(rep.firstNameTh || rep.firstNameThai || "");
    const thLast = norm(rep.lastNameTh || rep.lastNameThai || "");
    if (thFirst && thLast) {
      const key = `${thFirst}|${thLast}`;
      if (!thMap.has(key)) thMap.set(key, []);
      thMap.get(key).push(idx);
    }

    // English names
    const enFirst = norm(rep.firstNameEn || rep.firstNameEng || rep.firstNameEnglish || "");
    const enLast = norm(rep.lastNameEn || rep.lastNameEng || rep.lastNameEnglish || "");
    if (enFirst && enLast) {
      const key = `${enFirst}|${enLast}`;
      if (!enMap.has(key)) enMap.set(key, []);
      enMap.get(key).push(idx);
    }
  });

  // Create error objects for duplicates
  const errors = representatives.map(() => ({}));

  const applyDuplicateError = (indices, lang) => {
    if (!indices || indices.length < 2) return;
    indices.forEach((i) => {
      if (lang === "th") {
        errors[i].firstNameTh = errors[i].firstNameTh || "ชื่อ-นามสกุลซ้ำกับผู้แทนท่านอื่น";
        errors[i].lastNameTh = errors[i].lastNameTh || "ชื่อ-นามสกุลซ้ำกับผู้แทนท่านอื่น";
        errors[i].firstNameThai = errors[i].firstNameThai || "ชื่อ-นามสกุลซ้ำกับผู้แทนท่านอื่น";
        errors[i].lastNameThai = errors[i].lastNameThai || "ชื่อ-นามสกุลซ้ำกับผู้แทนท่านอื่น";
      } else if (lang === "en") {
        errors[i].firstNameEn = errors[i].firstNameEn || "First/Last name duplicates another representative";
        errors[i].lastNameEn = errors[i].lastNameEn || "First/Last name duplicates another representative";
        errors[i].firstNameEng = errors[i].firstNameEng || "First/Last name duplicates another representative";
        errors[i].lastNameEng = errors[i].lastNameEng || "First/Last name duplicates another representative";
        errors[i].firstNameEnglish = errors[i].firstNameEnglish || "First/Last name duplicates another representative";
        errors[i].lastNameEnglish = errors[i].lastNameEnglish || "First/Last name duplicates another representative";
      }
    });
  };

  thMap.forEach((indices) => applyDuplicateError(indices, "th"));
  enMap.forEach((indices) => applyDuplicateError(indices, "en"));

  return errors;
};

/**
 * Map Thai prename to English equivalent
 */
export const mapThaiPrenameToEnglish = (prenameTh) => {
  const map = {
    นาย: "Mr",
    นาง: "Mrs",
    นางสาว: "Ms",
    อื่นๆ: "Other",
  };
  return map[prenameTh] || "";
};

/**
 * Map English prename to Thai equivalent
 */
export const mapEnglishPrenameToThai = (prenameEn) => {
  const map = {
    Mr: "นาย",
    Mrs: "นาง",
    Ms: "นางสาว",
    Other: "อื่นๆ",
  };
  return map[prenameEn] || "";
};

/**
 * Get field error from multiple error sources
 */
export const getFieldError = (field, index, representativeErrors = [], duplicateErrors = []) => {
  if (representativeErrors[index]?.[field]) {
    return representativeErrors[index][field];
  }
  if (duplicateErrors[index]?.[field]) {
    return duplicateErrors[index][field];
  }
  return "";
};

/**
 * Field priority for error checking
 */
export const FIELD_PRIORITY = [
  "prename_th",
  "prename_en",
  "prename_other",
  "prename_other_en",
  "firstNameTh",
  "firstNameThai",
  "lastNameTh",
  "lastNameThai",
  "firstNameEn",
  "firstNameEng",
  "firstNameEnglish",
  "lastNameEn",
  "lastNameEng",
  "lastNameEnglish",
  "position",
  "email",
  "phone",
];

/**
 * Find first error field in representative
 */
export const findFirstErrorField = (errors) => {
  return FIELD_PRIORITY.find((field) => errors[field]);
};
