// Conversation context storage (in-memory for demo, should use Redis in production)
const conversationContexts = new Map();
const CONTEXT_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * Get conversation context for a session
 * @param {string} sessionId - Session ID
 * @returns {object|null} Context data or null if expired/not found
 */
export function getConversationContext(sessionId) {
  if (!sessionId) return null;

  const context = conversationContexts.get(sessionId);
  if (!context || Date.now() > context.expiry) {
    // Clean up expired context
    if (context) {
      conversationContexts.delete(sessionId);
    }
    return null;
  }
  return context.data;
}

/**
 * Set conversation context for a session
 * @param {string} sessionId - Session ID
 * @param {object} data - Context data to store
 */
export function setConversationContext(sessionId, data) {
  if (!sessionId || !data) return;

  conversationContexts.set(sessionId, {
    data: data,
    expiry: Date.now() + CONTEXT_EXPIRY,
  });
}

/**
 * Store pending choices for user selection
 * @param {string} sessionId - Session ID
 * @param {Array} choices - Array of FAQ choices with scores
 * @param {string} originalQuestion - Original user question
 */
export function setPendingChoices(sessionId, choices, originalQuestion) {
  if (!sessionId || !choices) return;

  const existingContext = getConversationContext(sessionId) || {};

  const newContext = {
    ...existingContext,
    pendingChoices: choices,
    originalQuestion: originalQuestion,
    choiceExpiry: Date.now() + 5 * 60 * 1000, // 5 minutes for choice selection
    timestamp: Date.now(),
  };

  setConversationContext(sessionId, newContext);
}

/**
 * Get pending choices for a session
 * @param {string} sessionId - Session ID
 * @returns {Array|null} Array of pending choices or null
 */
export function getPendingChoices(sessionId) {
  if (!sessionId) return null;

  const context = getConversationContext(sessionId);
  if (!context || !context.pendingChoices) return null;

  // Check if choices have expired
  if (context.choiceExpiry && Date.now() > context.choiceExpiry) {
    clearPendingChoices(sessionId);
    return null;
  }

  return context.pendingChoices;
}

/**
 * Clear pending choices for a session
 * @param {string} sessionId - Session ID
 */
export function clearPendingChoices(sessionId) {
  if (!sessionId) return;

  const context = getConversationContext(sessionId);
  if (context) {
    delete context.pendingChoices;
    delete context.originalQuestion;
    delete context.choiceExpiry;
    setConversationContext(sessionId, context);
  }
}

/**
 * Update conversation context with new FAQ interaction
 * @param {string} sessionId - Session ID
 * @param {object} faq - FAQ object that was matched
 * @param {string[]} userTokens - Tokenized user question
 * @param {Array} userIntents - Detected user intents
 */
export function updateContextWithFaq(sessionId, faq, userTokens, userIntents) {
  if (!sessionId || !faq) return;

  const newContext = {
    lastCategory: faq.category,
    lastKeywords: userTokens.slice(0, 5), // Keep only first 5 keywords
    intents: userIntents.slice(0, 3), // Keep only top 3 intents
    timestamp: Date.now(),
    lastFaqId: faq.id,
  };

  setConversationContext(sessionId, newContext);
}

/**
 * Clear conversation context for a session
 * @param {string} sessionId - Session ID
 */
export function clearConversationContext(sessionId) {
  if (!sessionId) return;
  conversationContexts.delete(sessionId);
}

/**
 * Clean up expired conversation contexts
 * This function should be called periodically
 */
export function cleanupExpiredContexts() {
  const now = Date.now();
  for (const [sessionId, context] of conversationContexts.entries()) {
    if (now > context.expiry) {
      conversationContexts.delete(sessionId);
    }
  }
}

/**
 * Get context statistics (for monitoring)
 * @returns {object} Context statistics
 */
export function getContextStats() {
  const now = Date.now();
  let activeContexts = 0;
  let expiredContexts = 0;

  for (const [sessionId, context] of conversationContexts.entries()) {
    if (now > context.expiry) {
      expiredContexts++;
    } else {
      activeContexts++;
    }
  }

  return {
    total: conversationContexts.size,
    active: activeContexts,
    expired: expiredContexts,
  };
}

// Clean up expired contexts every 5 minutes
setInterval(cleanupExpiredContexts, 5 * 60 * 1000);

// Export constants
export { CONTEXT_EXPIRY };
