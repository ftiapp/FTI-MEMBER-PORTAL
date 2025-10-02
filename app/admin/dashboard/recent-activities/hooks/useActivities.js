"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getDateRange } from "../utils/activityHelpers";

export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    actionType: "",
    adminName: "",
    dateRange: "all", // all, today, week, month, custom
  });

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    actionTypes: [],
    adminNames: [],
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5, // 5 รายการต่อหน้า
  });

  // Fetch activities from the API
  const fetchActivities = async (page = 1, limit = 5, appliedFilters = filters) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add date range
      if (appliedFilters.dateRange !== "all" && appliedFilters.dateRange !== "custom") {
        const dateRange = getDateRange(appliedFilters.dateRange);
        if (dateRange.startDate) params.append("startDate", dateRange.startDate);
        if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      } else if (appliedFilters.dateRange === "custom") {
        if (appliedFilters.startDate) params.append("startDate", appliedFilters.startDate);
        if (appliedFilters.endDate) params.append("endDate", appliedFilters.endDate);
      }

      // Add other filters
      if (appliedFilters.actionType) params.append("actionType", appliedFilters.actionType);
      if (appliedFilters.adminName) params.append("adminName", appliedFilters.adminName);

      const response = await fetch(`/api/admin/recent-activities?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();

      if (data.success) {
        setActivities(data.activities);
        setPagination(data.pagination);

        // Update filter options
        if (data.filterOptions) {
          setFilterOptions(data.filterOptions);
        }
        setError(null);
      } else {
        throw new Error(data.error || "Failed to fetch activities");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching activities:", err);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/admin/recent-activities/filter-options");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFilterOptions(data.options);
        }
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchFilterOptions();
    fetchActivities(pagination.currentPage, pagination.limit);
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Reset custom dates when changing date range
      if (key === "dateRange" && value !== "custom") {
        newFilters.startDate = "";
        newFilters.endDate = "";
      }

      return newFilters;
    });
  };

  // Apply filters
  const applyFilters = () => {
    fetchActivities(1, pagination.limit, filters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    toast.success("ใช้ตัวกรองเรียบร้อยแล้ว");
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      startDate: "",
      endDate: "",
      actionType: "",
      adminName: "",
      dateRange: "all",
    };
    setFilters(clearedFilters);
    fetchActivities(1, pagination.limit, clearedFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    toast.success("ล้างตัวกรองเรียบร้อยแล้ว");
  };

  // Refresh data
  const refreshData = () => {
    fetchActivities(pagination.currentPage, pagination.limit);
    toast.success("รีเฟรชข้อมูลเรียบร้อยแล้ว");
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActivities(newPage, pagination.limit);
    }
  };

  // Check if filters are applied
  const hasActiveFilters = () => {
    return (
      filters.dateRange !== "all" ||
      filters.actionType !== "" ||
      filters.adminName !== "" ||
      filters.startDate !== "" ||
      filters.endDate !== ""
    );
  };

  return {
    activities,
    loading,
    error,
    pagination,
    filters,
    showFilters,
    filterOptions,
    setShowFilters,
    handleFilterChange,
    applyFilters,
    clearFilters,
    refreshData,
    handlePageChange,
    hasActiveFilters,
  };
}
