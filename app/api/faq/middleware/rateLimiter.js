// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 20; // Maximum 20 requests per minute

// Store IP addresses and their request counts (in-memory)
// Note: In production, consider using Redis for distributed rate limiting
const ipRequestCounts = new Map();

/**
 * Check rate limit for incoming requests
 * @param {Request} request - Next.js Request object
 * @returns {Promise<{allowed: boolean, resetTime?: number}>}
 */
export async function checkRateLimit(request) {
  // Get client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const now = Date.now();

  // Get current count for this IP
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  const record = ipRequestCounts.get(ip);

  // Reset counter if window has passed
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return { allowed: true };
  }

  // Check if rate limit exceeded
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, resetTime: record.resetTime };
  }

  // Increment counter
  record.count++;
  return { allowed: true };
}

/**
 * Clean up expired rate limit entries
 * This function should be called periodically
 */
export function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now > record.resetTime) {
      ipRequestCounts.delete(ip);
    }
  }
}

// Clean up expired rate limit entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

// Export constants for response headers
export { MAX_REQUESTS_PER_WINDOW };
