/**
 * Validates Thai ID card number
 * @param {string} id - Thai ID card number
 * @returns {boolean} - Whether the ID is valid
 */
export const validateThaiID = (id) => {
  if (!id) return false;
  
  // Remove spaces and dashes
  id = id.replace(/[- ]/g, '');
  
  // Check length
  if (id.length !== 13) return false;
  
  // Check if all characters are digits
  if (!/^\d+$/.test(id)) return false;
  
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  
  const checkDigit = (11 - (sum % 11)) % 10;
  
  // Check if the calculated check digit matches the last digit
  return parseInt(id.charAt(12)) === checkDigit;
};

/**
 * Validates if text contains only Thai characters
 * @param {string} text - Text to validate
 * @returns {boolean} - Whether the text contains only Thai characters
 */
export const validateThaiText = (text) => {
  if (!text) return false;
  
  // Thai Unicode range: \u0E00-\u0E7F
  const thaiRegex = /^[\u0E00-\u0E7F\s.]+$/;
  return thaiRegex.test(text);
};

/**
 * Validates if text contains only English characters
 * @param {string} text - Text to validate
 * @returns {boolean} - Whether the text contains only English characters
 */
export const validateEnglishText = (text) => {
  if (!text) return false;
  
  // English characters, spaces, and common punctuation
  const englishRegex = /^[a-zA-Z\s.'-]+$/;
  return englishRegex.test(text);
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates Thai mobile number format
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} - Whether the mobile number is valid
 */
export const validateMobile = (mobile) => {
  if (!mobile) return false;
  
  // Remove spaces and dashes
  mobile = mobile.replace(/[- ]/g, '');
  
  // Check length and format (starts with 0)
  if (mobile.length !== 10 || !mobile.startsWith('0')) return false;
  
  // Check if all characters are digits
  return /^\d+$/.test(mobile);
};

/**
 * Validates postal code format
 * @param {string} postalCode - Postal code to validate
 * @returns {boolean} - Whether the postal code is valid
 */
export const validatePostalCode = (postalCode) => {
  if (!postalCode) return false;
  
  // Remove spaces
  postalCode = postalCode.replace(/\s/g, '');
  
  // Check length and if all characters are digits
  return postalCode.length === 5 && /^\d+$/.test(postalCode);
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const validateURL = (url) => {
  if (!url) return true; // URL is optional
  
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch (e) {
    return false;
  }
};
