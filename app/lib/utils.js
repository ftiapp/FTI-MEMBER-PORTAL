/**
 * Get client IP address from request
 * @param {Request} request - The request object
 * @returns {string} - The client IP address
 */
export function getClientIp(request) {
  // Try to get IP from headers first (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Try to get IP from request
  const ip = request.headers.get('x-real-ip');
  if (ip) {
    return ip;
  }
  
  // Default to localhost if no IP found
  return '127.0.0.1';
}
