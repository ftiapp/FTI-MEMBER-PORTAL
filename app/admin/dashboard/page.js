"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import HeaderAndStatsSection from "./dasboardoverall/HeaderAndStatsSection";
import MainContentSection from "./dasboardoverall/MainContentSection";

/**
 * Modern Admin Dashboard Component
 * Optimized with better performance, error handling, and code organization
 */

// Constants
const FILTER_OPTIONS = {
  membership: ["pending", "approved", "rejected", "all"],
  messages: ["unread", "read", "replied", "all"],
};

const STATUS_STYLES = {
  0: "bg-yellow-100 text-yellow-700",
  1: "bg-green-100 text-green-700",
  2: "bg-red-100 text-red-700",
  unread: "bg-yellow-100 text-yellow-700",
  read: "bg-blue-100 text-blue-700",
  replied: "bg-green-100 text-green-700",
};

const STATUS_LABELS = {
  0: "pending",
  1: "approved",
  2: "rejected",
};

// Helper: safe JSON fetch with better errors
const fetchJson = async (input, init) => {
  const res = await fetch(input, init);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `${res.status} ${res.statusText} from ${typeof input === "string" ? input : input?.url || "request"}: non-JSON response: ${text.slice(0, 200)}`,
    );
  }
  const data = await res.json();
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || "Request failed";
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return data;
};

// Custom hooks
const useAsyncData = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// API functions
const api = {
  fetchDashboardStats: async () => {
    const [userStatsData, dashData] = await Promise.all([
      fetchJson("/api/admin/UserCountSTAT"),
      fetchJson("/api/admin/dashboard-data", { cache: "no-store", next: { revalidate: 0 } }),
    ]);

    const pendingUpdates = dashData?.success
      ? Number(dashData.counts?.profileUpdates || 0) +
        Number(dashData.counts?.addressUpdates || 0) +
        Number(dashData.counts?.productUpdates || 0)
      : 0;

    return {
      stats: {
        pendingUpdates,
        totalUsers: userStatsData.success ? userStatsData.counts.total : 0,
        verifiedUsers: userStatsData.success ? userStatsData.counts.verified : 0,
        notVerifiedUsers: userStatsData.success ? userStatsData.counts.notVerified : 0,
      },
      adminInfo: dashData.success ? dashData.admin : null,
    };
  },

  fetchRecentData: async (endpoint, filter, limit = 5) => {
    const data = await fetchJson(
      `${endpoint}?status=${encodeURIComponent(filter)}&limit=${limit}&page=1`,
    );
    return data.success ? data.data || data.messages || [] : [];
  },
};

export default function AdminDashboard() {
  const router = useRouter();

  // Main dashboard data
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useAsyncData(api.fetchDashboardStats);

  // Filter states
  const [filters, setFilters] = useState({
    membership: "pending",
    memberMsg: "unread",
    guestMsg: "unread",
  });

  // Recent data states
  const [recentData, setRecentData] = useState({
    memberships: [],
    memberMsgs: [],
    guestMsgs: [],
  });

  const [recentLoading, setRecentLoading] = useState({
    membership: false,
    memberMsg: false,
    guestMsg: false,
  });

  // Memoized values
  const stats = useMemo(
    () =>
      dashboardData?.stats || {
        pendingUpdates: 0,
        totalUsers: 0,
        verifiedUsers: 0,
        notVerifiedUsers: 0,
      },
    [dashboardData],
  );

  const adminInfo = useMemo(() => dashboardData?.adminInfo, [dashboardData]);

  // Generic filter update function
  const updateFilter = useCallback((type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  }, []);

  // Generic data fetcher
  const fetchRecentData = useCallback(async (type, endpoint, filter) => {
    setRecentLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const data = await api.fetchRecentData(endpoint, filter);
      setRecentData((prev) => ({ ...prev, [type]: data }));
    } catch (error) {
      console.error(`Failed to fetch recent ${type}:`, error);
      setRecentData((prev) => ({ ...prev, [type]: [] }));
    } finally {
      setRecentLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  // Effect for fetching recent data when filters change
  useEffect(() => {
    fetchRecentData("memberships", "/api/admin/membership-requests", filters.membership);
  }, [filters.membership, fetchRecentData]);

  useEffect(() => {
    fetchRecentData("memberMsgs", "/api/admin/contact-messages", filters.memberMsg);
  }, [filters.memberMsg, fetchRecentData]);

  useEffect(() => {
    fetchRecentData("guestMsgs", "/api/admin/guest-messages", filters.guestMsg);
  }, [filters.guestMsg, fetchRecentData]);

  const LoadingScreen = () => (
    <AdminLayout>
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 rounded-full animate-ping border-t-purple-600 mx-auto opacity-20"></div>
          </div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (dashboardLoading) {
    return <LoadingScreen />;
  }

  if (dashboardError) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center text-red-600">
            <p>เกิดข้อผิดพลาด: {dashboardError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              โหลดใหม่
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <HeaderAndStatsSection stats={stats} adminInfo={adminInfo} />
        <MainContentSection
          stats={stats}
          filters={filters}
          recentData={recentData}
          recentLoading={recentLoading}
          updateFilter={updateFilter}
          FILTER_OPTIONS={FILTER_OPTIONS}
          STATUS_STYLES={STATUS_STYLES}
          STATUS_LABELS={STATUS_LABELS}
          adminInfo={adminInfo}
        />
      </div>
    </AdminLayout>
  );
}
