// utils/unreadCountCache.js
// Simple in-memory cache for unread count with timestamp

let cachedUnreadCount = 0;
let lastFetchTime = 0;

export function getCachedUnreadCount() {
  return { count: cachedUnreadCount, lastFetchTime };
}

export function setCachedUnreadCount(count) {
  cachedUnreadCount = count;
  lastFetchTime = Date.now();
}
