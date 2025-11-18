"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

/**
 * Custom hook for managing product update requests with optimized caching
 *
 * Features:
 * - Client-side caching with TTL to reduce API calls
 * - Status-based request fetching
 * - Search functionality
 * - Pagination support
 * - Approve and reject functionality with cache invalidation
 * @returns {Object} - Product update requests state and functions
 */
export function useProductUpdateRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "pending",
    search: "",
  });

  // Cache state
  const [cache, setCache] = useState({});
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  const isDev = process.env.NODE_ENV !== "production";

  /**
   * Generate a cache key based on current filter parameters
   */
  const getCacheKey = useCallback((page, limit, status, search) => {
    return `product_updates_${status || "all"}_${page}_${limit}_${search || "nosearch"}`;
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback(
    (cacheKey) => {
      if (isDev) return false;
      if (!cache[cacheKey]) return false;
      const now = new Date().getTime();
      return now - cache[cacheKey].timestamp < CACHE_TTL;
    },
    [cache, isDev],
  );

  /**
   * Fetch product update requests from API or cache
   */
  const fetchRequests = useCallback(
    async (skipCache = false) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status,
          search: filters.search,
        });

        const cacheKey = getCacheKey(
          pagination.page,
          pagination.limit,
          filters.status,
          filters.search,
        );

        // Check cache first unless skipCache is true
        if (!skipCache && isCacheValid(cacheKey)) {
          const cachedData = cache[cacheKey].data;
          setRequests(cachedData.updates);
          setPagination((prev) => ({
            ...prev,
            total: cachedData.pagination.total,
            totalPages: cachedData.pagination.totalPages,
          }));
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/admin/product-update/list?${queryParams.toString()}`, {
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401) {
          toast.error("กรุณาเข้าสู่ระบบ");
          router.push("/admin/login");
          return;
        }

        const data = await response.json();

        if (data.success) {
          setRequests(data.updates);
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
          }));

          // Update cache
          setCache((prevCache) => ({
            ...prevCache,
            [cacheKey]: {
              data: data,
              timestamp: new Date().getTime(),
            },
          }));
        } else {
          setError(data.message || "ไม่สามารถดึงข้อมูลคำขอแก้ไขข้อมูลสินค้าได้");
          toast.error(data.message || "ไม่สามารถดึงข้อมูลคำขอแก้ไขข้อมูลสินค้าได้");
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขข้อมูลสินค้า");
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำขอแก้ไขข้อมูลสินค้า");
        console.error("Error fetching product update requests:", err);
      } finally {
        setLoading(false);
      }
    },
    [
      pagination.page,
      pagination.limit,
      filters.status,
      filters.search,
      cache,
      getCacheKey,
      isCacheValid,
      router,
    ],
  );

  /**
   * Invalidate cache for a specific status or all statuses
   */
  const invalidateCache = useCallback((status = null) => {
    setCache((prevCache) => {
      const newCache = { ...prevCache };
      // Remove all cache entries that match the status or all if status is null
      Object.keys(newCache).forEach((key) => {
        if (!status || key.includes(`product_updates_${status}`)) {
          delete newCache[key];
        }
      });
      return newCache;
    });
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset to first page when filter changes
    }));
  }, []);

  // Approve a product update request
  const approveRequest = useCallback(
    async (id, adminNotes) => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/product-update/approve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, admin_notes: adminNotes }),
          cache: "no-store",
        });

        if (response.status === 401) {
          toast.error("กรุณาเข้าสู่ระบบ");
          router.push("/admin/login");
          return false;
        }

        const data = await response.json();

        if (data.success) {
          toast.success(data.message || "อนุมัติคำขอสำเร็จ");
          // Invalidate cache for both pending and approved status
          invalidateCache("pending");
          invalidateCache("approved");
          // Refresh the requests list
          fetchRequests(true); // Skip cache to get fresh data
          return true;
        } else {
          toast.error(data.message || "เกิดข้อผิดพลาดในการอนุมัติคำขอ");
          return false;
        }
      } catch (error) {
        console.error("Error approving request:", error);
        toast.error("เกิดข้อผิดพลาดในการอนุมัติคำขอ");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router, fetchRequests, invalidateCache],
  );

  // Handle reject request
  const handleReject = useCallback(
    async (id, rejectReason) => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/product-update/reject", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, reject_reason: rejectReason }),
          cache: "no-store",
        });

        if (response.status === 401) {
          toast.error("กรุณาเข้าสู่ระบบ");
          router.push("/admin/login");
          return { success: false };
        }

        const data = await response.json();

        if (data.success) {
          toast.success("ปฏิเสธคำขอแก้ไขข้อมูลสินค้าสำเร็จ");
          // Invalidate cache for both pending and rejected status
          invalidateCache("pending");
          invalidateCache("rejected");
          // Refresh the list with fresh data
          fetchRequests(true); // Skip cache
        } else {
          toast.error(data.message || "ไม่สามารถปฏิเสธคำขอแก้ไขข้อมูลสินค้าได้");
        }

        return data;
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูลสินค้า");
        console.error("Error rejecting product update request:", err);
        return { success: false, message: "เกิดข้อผิดพลาดในการปฏิเสธคำขอแก้ไขข้อมูลสินค้า" };
      } finally {
        setLoading(false);
      }
    },
    [router, fetchRequests, invalidateCache],
  );

  // Fetch requests when filters or pagination changes
  useEffect(() => {
    fetchRequests(false); // Use cache if available
  }, [pagination.page, pagination.limit, filters.status, filters.search, fetchRequests]);

  // Function to manually refresh data
  const refreshData = useCallback(() => {
    return fetchRequests(true); // Skip cache to get fresh data
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    pagination,
    filters,
    handlePageChange,
    handleFilterChange,
    approveRequest,
    handleReject,
    refreshData,
    refreshRequests: fetchRequests,
  };
}
