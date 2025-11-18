"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Create a shared state that persists between component renders
const globalState = {
  adminData: null,
  pendingCounts: {
    verifications: 0,
    profileUpdates: 0,
    addressUpdates: 0,
    guestMessages: 0,
    productUpdates: 0,
    membershipRequests: 0,
  },
  lastFetched: 0,
  listeners: new Set(),
};

// Function to notify all listeners of state changes
const notifyListeners = () => {
  globalState.listeners.forEach((listener) => listener());
};

// Use a single optimized API call for both admin data and pending counts
const fetchDashboardData = async (force = false) => {
  // Only fetch if data is stale (older than 5 minutes) or forced
  const now = Date.now();
  if (!force && globalState.lastFetched && now - globalState.lastFetched < 300000) {
    return;
  }

  try {
    const response = await fetch("/api/admin/dashboard-data", {
      // Use cache: 'no-cache' instead of 'no-store' for better performance
      cache: "no-cache",
    });

    // Explicitly handle unauthorized session so UI can redirect instead of hanging
    if (response.status === 401) {
      globalState.adminData = null;
      globalState.lastFetched = now;
      notifyListeners();
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const data = await response.json();

    if (data.success) {
      globalState.adminData = data.admin;
      globalState.pendingCounts = data.counts;
      globalState.lastFetched = now;
      notifyListeners();
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};

export function useAdminData() {
  const [state, setState] = useState({
    adminData: globalState.adminData,
    adminLevel: globalState.adminData?.adminLevel || 0,
    isLoading: !globalState.adminData,
  });

  useEffect(() => {
    // Function to update local state from global state
    const updateFromGlobalState = () => {
      // แสดงค่า adminLevel ที่ได้รับจาก API ในคอนโซล
      console.log("Admin data from API:", globalState.adminData);
      console.log("Admin level from API:", globalState.adminData?.adminLevel);

      setState({
        adminData: globalState.adminData,
        adminLevel: globalState.adminData?.adminLevel || 0,
        isLoading: false,
      });
    };

    // Add listener to global state
    globalState.listeners.add(updateFromGlobalState);

    // Fetch data if needed
    if (!globalState.adminData) {
      fetchDashboardData();
    } else {
      updateFromGlobalState();
    }

    return () => {
      globalState.listeners.delete(updateFromGlobalState);
    };
  }, []);

  return state;
}

export function usePendingCounts() {
  const [counts, setCounts] = useState(globalState.pendingCounts);
  const intervalRef = useRef(null);
  const esRef = useRef(null);

  const fetchPendingCounts = useCallback(() => {
    fetchDashboardData(true);
  }, []);

  useEffect(() => {
    // Function to update local state from global state
    const updateFromGlobalState = () => {
      setCounts({ ...globalState.pendingCounts });
    };

    // Add listener to global state
    globalState.listeners.add(updateFromGlobalState);

    // Set initial state
    updateFromGlobalState();

    // Set up interval to refresh count every 10 minutes (fallback)
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => fetchDashboardData(true), 600000);
    }

    // Connect to SSE for real-time updates
    if (typeof window !== "undefined" && !esRef.current) {
      try {
        const es = new EventSource("/api/admin/pending-counts/stream");
        esRef.current = es;
        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data || "{}");
            if (data && data.success && data.counts) {
              // Update global state and notify listeners
              globalState.pendingCounts = { ...globalState.pendingCounts, ...data.counts };
              updateFromGlobalState();
            }
          } catch (e) {
            // ignore JSON errors
          }
        };
        es.onerror = () => {
          // On error, close and allow fallback interval to keep working
          try {
            es.close();
          } catch {}
          esRef.current = null;
        };
      } catch (e) {
        // If EventSource fails, fallback to interval only
      }
    }

    return () => {
      globalState.listeners.delete(updateFromGlobalState);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch {}
        esRef.current = null;
      }
    };
  }, []);

  return { pendingCounts: counts, fetchPendingCounts };
}
