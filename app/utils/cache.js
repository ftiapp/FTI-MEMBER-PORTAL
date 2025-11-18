// Simple in-memory cache with TTL support
const isDev = process.env.NODE_ENV !== "production";

class MemoryCache {
  constructor(ttl = 5 * 60 * 1000) {
    // Default 5 minutes TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, customTtl) {
    if (isDev) {
      return;
    }
    const item = {
      value,
      timestamp: Date.now(),
      ttl: customTtl || this.ttl,
    };
    this.cache.set(key, item);
  }

  get(key) {
    if (isDev) {
      return null;
    }
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    if (isDev) {
      return;
    }
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create different cache instances for different purposes
export const apiCache = new MemoryCache(5 * 60 * 1000); // 5 minutes for API calls
export const staticCache = new MemoryCache(60 * 60 * 1000); // 1 hour for static data
export const userCache = new MemoryCache(30 * 60 * 1000); // 30 minutes for user data

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    if (!isDev) {
      apiCache.cleanup();
      staticCache.cleanup();
      userCache.cleanup();
    }
  },
  5 * 60 * 1000,
);

// Enhanced fetch with caching
export async function fetchWithCache(url, options = {}, cacheInstance = apiCache) {
  const cacheKey = `${url}-${JSON.stringify(options)}-${options.method || "GET"}`;

  // Only cache GET requests
  if (options.method && options.method !== "GET") {
    return fetch(url, options);
  }

  if (isDev) {
    try {
      console.log(`Fetching (dev, no cache): ${url}`);
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    }
  }

  // Check cache first
  const cached = cacheInstance.get(cacheKey);
  if (cached) {
    console.log(`Cache hit for: ${url}`);
    return cached;
  }

  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache successful responses
    cacheInstance.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

// React hook for caching
import { useState, useEffect, useCallback } from "react";

export function useCachedFetch(url, options = {}, cacheInstance = apiCache) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const cacheKey = `${url}-${JSON.stringify(options)}-${options.method || "GET"}`;

      // Check cache first
      const cached = cacheInstance.get(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const result = await fetchWithCache(url, options, cacheInstance);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options, cacheInstance]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to manually refetch
  const refetch = useCallback(() => {
    const cacheKey = `${url}-${JSON.stringify(options)}-${options.method || "GET"}`;
    cacheInstance.delete(cacheKey);
    fetchData();
  }, [url, options, cacheInstance, fetchData]);

  return { data, loading, error, refetch };
}

// Debounced fetch for search inputs
export function useDebouncedFetch(url, delay = 300) {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const searchUrl = `${url}?q=${encodeURIComponent(query)}`;
        const result = await fetchWithCache(searchUrl);
        setData(result);
      } catch (error) {
        console.error("Search error:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, url, delay]);

  return { query, setQuery, data, loading };
}

// Cache utilities for specific data types
export const cacheUtils = {
  // Cache user session
  cacheUserSession: (userData) => {
    userCache.set("user-session", userData, 30 * 60 * 1000); // 30 minutes
  },

  getUserSession: () => {
    return userCache.get("user-session");
  },

  clearUserSession: () => {
    userCache.delete("user-session");
  },

  // Cache form data
  cacheFormData: (formId, formData) => {
    apiCache.set(`form-${formId}`, formData, 60 * 60 * 1000); // 1 hour
  },

  getFormData: (formId) => {
    return apiCache.get(`form-${formId}`);
  },

  clearFormData: (formId) => {
    apiCache.delete(`form-${formId}`);
  },

  // Cache API responses with custom TTL
  cacheApiResponse: (endpoint, data, ttl) => {
    apiCache.set(endpoint, data, ttl);
  },

  getCachedApiResponse: (endpoint) => {
    return apiCache.get(endpoint);
  },

  // Invalidate cache by pattern
  invalidatePattern: (pattern) => {
    const stats = apiCache.getStats();
    stats.keys.forEach((key) => {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    });
  },
};

// Export cache instances for direct use
export { MemoryCache };
