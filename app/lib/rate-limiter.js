// lib/rate-limiter.js
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.cache = new Map();
  }

  // Rate limiting per IP
  checkRateLimit(ip, windowMs = 60000, maxRequests = 100) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }

    const requests = this.requests.get(ip);

    // Remove old requests outside window
    const validRequests = requests.filter((time) => time > windowStart);
    this.requests.set(ip, validRequests);

    if (validRequests.length >= maxRequests) {
      return {
        allowed: false,
        resetTime: validRequests[0] + windowMs,
        remaining: 0,
      };
    }

    // Add current request
    validRequests.push(now);

    return {
      allowed: true,
      remaining: maxRequests - validRequests.length,
    };
  }

  // Simple in-memory cache
  getCached(key, ttlMs = 300000) {
    // 5 minutes default
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCache(key, data, ttlMs = 300000) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs,
    });
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();

    // Clean requests older than 1 hour
    for (const [ip, requests] of this.requests.entries()) {
      const validRequests = requests.filter((time) => time > now - 3600000);
      if (validRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validRequests);
      }
    }

    // Clean expired cache
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Clean up every 5 minutes
setInterval(() => rateLimiter.cleanup(), 300000);

export default rateLimiter;
