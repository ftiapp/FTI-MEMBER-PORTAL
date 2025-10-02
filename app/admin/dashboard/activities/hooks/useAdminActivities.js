"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

/**
 * Custom hook for fetching and managing admin activities with caching
 *
 * Features:
 * - Client-side caching with configurable TTL
 * - Pagination support
 * - Filtering by activity type and date range
 * - Optimized to reduce redundant API calls
 */
export default function useAdminActivities() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Cache state
  const [cache, setCache] = useState({});
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  /**
   * Generate a cache key based on current filter parameters
   */
  const getCacheKey = useCallback(() => {
    return `activities_${filter}_${page}_${dateRange.start || "nostart"}_${dateRange.end || "noend"}`;
  }, [filter, page, dateRange]);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback(
    (cacheKey) => {
      if (!cache[cacheKey]) return false;
      const now = new Date().getTime();
      return now - cache[cacheKey].timestamp < CACHE_TTL;
    },
    [cache],
  );

  /**
   * Fetch activities from API or cache
   */
  const fetchActivities = useCallback(
    async (skipCache = false) => {
      try {
        setIsLoading(true);

        const cacheKey = getCacheKey();

        // Check cache first unless skipCache is true
        if (!skipCache && isCacheValid(cacheKey)) {
          const cachedData = cache[cacheKey].data;
          setActivities(cachedData.activities);
          setTotalPages(cachedData.pagination.totalPages);
          setIsLoading(false);
          return;
        }

        // Build API URL with query parameters
        let url = `/api/admin/recent-activities?page=${page}`;

        if (dateRange.start) {
          url += `&start=${dateRange.start}`;
        }

        if (dateRange.end) {
          url += `&end=${dateRange.end}`;
        }

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("กรุณาเข้าสู่ระบบ");
            router.push("/admin");
            return;
          }
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        if (result.success) {
          // Update state with fetched data
          setActivities(result.activities);
          setTotalPages(result.pagination.totalPages || 1);

          // Update cache
          setCache((prevCache) => ({
            ...prevCache,
            [cacheKey]: {
              data: result,
              timestamp: new Date().getTime(),
            },
          }));
        } else {
          toast.error(result.message || "ไม่สามารถดึงข้อมูลได้");
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setIsLoading(false);
      }
    },
    [filter, page, dateRange, router, getCacheKey, isCacheValid, cache],
  );

  /**
   * Fetch activities when filter, page, or date range changes
   */
  useEffect(() => {
    fetchActivities();
  }, [filter, page, fetchActivities]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  }, []);

  /**
   * Handle date range change
   */
  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Apply date filter
   */
  const applyDateFilter = useCallback(() => {
    setPage(1); // Reset to first page when applying new date filter
    fetchActivities(true); // Skip cache when applying new filter
  }, [fetchActivities]);

  /**
   * Clear date filter
   */
  const clearDateFilter = useCallback(() => {
    setDateRange({
      start: "",
      end: "",
    });
    setPage(1);
    // The fetchActivities will be triggered by the useEffect when dateRange changes
  }, []);

  /**
   * Refresh activities data (force fetch from API)
   */
  const refreshActivities = useCallback(() => {
    fetchActivities(true); // Skip cache
  }, [fetchActivities]);

  /**
   * Format activity type badge with appropriate color
   */
  const renderActivityTypeBadge = useCallback((type) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";

    switch (type) {
      case "login":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case "logout":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
      case "create":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "update":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "delete":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "approve":
      case "approve_member":
      case "approve_profile_update":
      case "approve_address_update":
      case "approve_product_update":
        bgColor = "bg-emerald-100";
        textColor = "text-emerald-800";
        break;
      case "reject":
      case "reject_member":
      case "reject_profile_update":
      case "reject_address_update":
      case "reject_product_update":
        bgColor = "bg-rose-100";
        textColor = "text-rose-800";
        break;
    }

    return {
      bgColor,
      textColor,
      type,
    };
  }, []);

  /**
   * Format activity details for display
   */
  const formatActivityDetails = useCallback((activity) => {
    try {
      if (typeof activity.details === "string") {
        // Try to parse if it's a JSON string
        try {
          const details = JSON.parse(activity.details);
          return Object.entries(details)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
        } catch {
          // If not valid JSON, return as is
          return activity.details;
        }
      } else if (typeof activity.details === "object" && activity.details !== null) {
        return Object.entries(activity.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }
      return "ไม่มีรายละเอียด";
    } catch (error) {
      console.error("Error formatting activity details:", error);
      return "ไม่สามารถแสดงรายละเอียดได้";
    }
  }, []);

  // Return all necessary state and handlers
  return {
    activities,
    isLoading,
    filter,
    page,
    totalPages,
    dateRange,
    handleFilterChange,
    handleDateChange,
    applyDateFilter,
    clearDateFilter,
    setPage,
    refreshActivities,
    renderActivityTypeBadge,
    formatActivityDetails,
  };
}
