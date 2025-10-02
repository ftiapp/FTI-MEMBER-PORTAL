/**
 * Helper function to sanitize input to prevent SQL injection
 * @param {any} input - Input to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  // Remove SQL injection patterns
  return input
    .replace(/[\\"']/g, "")
    .replace(/;/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "")
    .replace(/UNION/gi, "")
    .replace(/SELECT/gi, "")
    .replace(/UPDATE/gi, "")
    .replace(/DELETE/gi, "")
    .replace(/DROP/gi, "")
    .replace(/INSERT/gi, "")
    .replace(/ALTER/gi, "")
    .replace(/CREATE/gi, "")
    .trim();
}

/**
 * Validate question input
 * @param {string} question - Question to validate
 * @returns {{isValid: boolean, message?: string}} Validation result
 */
export function validateQuestion(question) {
  if (!question || typeof question !== "string") {
    return { isValid: false, message: "กรุณาระบุคำถาม" };
  }

  if (question.trim().length < 2) {
    return { isValid: false, message: "กรุณาระบุคำถามที่มีความยาวมากกว่า 1 ตัวอักษร" };
  }

  if (question.length > 1000) {
    return { isValid: false, message: "คำถามยาวเกินไป กรุณาระบุคำถามที่สั้นกว่านี้" };
  }

  return { isValid: true };
}

/**
 * Validate session ID
 * @param {string} sessionId - Session ID to validate
 * @returns {boolean} Whether session ID is valid
 */
export function validateSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== "string") {
    return false;
  }

  // Check if session ID follows expected pattern (session_timestamp_randomstring)
  const sessionPattern = /^session_\d+_[a-z0-9]{9}$/;
  return sessionPattern.test(sessionId);
}

/**
 * Generate a new session ID
 * @returns {string} New session ID
 */
export function generateSessionId() {
  return "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}
