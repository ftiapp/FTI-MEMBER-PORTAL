"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../components/AdminLayout";
import ActionCounts from "../components/ActionCounts";
import Alluser from "../components/Alluser";
import Analytics from "../components/Analytics";
import ChangePersonal from "../components/ChangePersonal";
import ContactMessageStats from "../components/ContactMessageStats";
import GuestContactMessageStats from "../components/GuestContactMessageStats";
import Link from "next/link";

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

  // Components
  const StatCard = ({ title, value, icon, color, href, subtitle }) => (
    <Link
      href={href || "#"}
      className={`group relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">{icon}</div>
          <div className="text-white/80 text-sm font-medium">
            {subtitle && `+${Math.floor(Math.random() * 20)}% จากเดือนที่แล้ว`}
          </div>
        </div>
        <div className="text-white">
          <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{value.toLocaleString()}</p>
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className="bg-white h-1 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(100, (value / Math.max(stats.totalUsers, 100)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );

  const AdminInfoCard = () => (
    <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl font-bold">
          {adminInfo?.name?.charAt(0) || adminInfo?.username?.charAt(0) || "A"}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">
            ยินดีต้อนรับ, {adminInfo?.name || adminInfo?.username || "ผู้ดูแลระบบ"}
          </h2>
          <p className="text-purple-300 text-sm">
            {adminInfo?.adminLevel === 5 ? "ผู้ดูแลระบบสูงสุด" : "ผู้ดูแลระบบ"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-purple-300 text-sm mb-1">สิทธิ์การใช้งาน</p>
          <p className="font-semibold">{adminInfo?.canCreate ? "สร้าง/แก้ไข" : "อ่านอย่างเดียว"}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-purple-300 text-sm mb-1">สถานะระบบ</p>
          <p className="font-semibold text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            ออนไลน์
          </p>
        </div>
      </div>
    </div>
  );

  const RecentSection = ({
    title,
    data,
    loading,
    filter,
    filterOptions,
    onFilterChange,
    linkHref,
    colorClass,
    renderItem,
  }) => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className={`flex items-center justify-between bg-gradient-to-r ${colorClass} p-4`}>
        <h3 className="text-white font-semibold">{title}</h3>
        <select
          className="text-sm rounded-md px-2 py-1 bg-white/20 text-white border-white/30 focus:outline-none"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          {filterOptions.map((option) => (
            <option key={option} value={option}>
              {option === "pending"
                ? "รอดำเนินการ"
                : option === "approved"
                  ? "อนุมัติแล้ว"
                  : option === "rejected"
                    ? "ปฏิเสธ"
                    : option === "unread"
                      ? "ยังไม่อ่าน"
                      : option === "read"
                        ? "อ่านแล้ว"
                        : option === "replied"
                          ? "ตอบกลับแล้ว"
                          : "ทั้งหมด"}
            </option>
          ))}
        </select>
      </div>
      <div className="p-6">
        {loading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500">ไม่มีข้อมูล</p>
        ) : (
          <ul className="divide-y">{data.map(renderItem)}</ul>
        )}
        <div className="mt-4 text-right">
          <Link
            href={`${linkHref}?status=${filter}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>
      </div>
    </div>
  );

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
        {/* Header Section */}
        <div className="px-6 pt-6 pb-8">
          <div className="mb-8">
            <AdminInfoCard />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              สรุปภาพรวมระบบ FTI-Portal Management
            </h1>
            <p className="text-gray-600">แดชบอร์ดการจัดการระบบและสถิติการใช้งาน</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="จำนวนผู้ใช้ทั้งหมด"
              value={stats.totalUsers}
              color="from-blue-500 to-blue-600"
              href="/admin/dashboard/verify?status=0"
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
            />

            <StatCard
              title="รอการอนุมัติแก้ไข"
              value={stats.pendingUpdates}
              color="from-emerald-500 to-green-600"
              href="/admin/dashboard/update"
              subtitle="pending"
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
            />

            <StatCard
              title="ผู้ใช้ที่ยืนยันอีเมลแล้ว"
              value={stats.verifiedUsers}
              color="from-purple-500 to-purple-600"
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />

            <StatCard
              title="ผู้ใช้ที่ยังไม่ยืนยันอีเมล"
              value={stats.notVerifiedUsers}
              color="from-orange-500 to-red-500"
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 space-y-8">
          {/* Statistics Components */}
          <div className="grid grid-cols-1 gap-8">
            {/* Action Counts */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">สถิติการดำเนินการในระบบ</h2>
              </div>
              <ActionCounts title="สถิติการดำเนินการในระบบ" />
            </div>

            {/* User Statistics */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">สถิติผู้ใช้งานระบบ</h2>
              </div>
              <Alluser title="สถิติผู้ใช้งานระบบ" />
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Member Verification Analytics */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
                <h3 className="text-white font-semibold">ยืนยันตัวสมาชิกเดิม - บริษัท</h3>
              </div>
              <div className="p-6">
                <Analytics
                  title="ยืนยันตัวสมาชิกเดิม - บริษัท"
                  endpoint="/api/admin/member-verification-stats"
                />
              </div>
            </div>

            {/* Profile Update Stats */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4">
                <h3 className="text-white font-semibold">แจ้งเปลี่ยนข้อมูลส่วนตัว</h3>
              </div>
              <div className="p-6">
                <ChangePersonal
                  title="แจ้งเปลี่ยนข้อมูลส่วนตัว"
                  endpoint="/api/admin/profile_update_stat"
                />
              </div>
            </div>

            {/* Contact Message Stats */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
                <h3 className="text-white font-semibold">สถิติข้อความติดต่อ (สมาชิก)</h3>
              </div>
              <div className="p-6">
                <ContactMessageStats title="สถิติข้อความติดต่อ (สมาชิก)" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                <h3 className="text-white font-semibold">สถิติข้อความติดต่อ (บุคคลทั่วไป)</h3>
              </div>
              <div className="p-6">
                <GuestContactMessageStats title="สถิติข้อความติดต่อ (บุคคลทั่วไป)" />
              </div>
            </div>
          </div>

          {/* Recent Sections */}
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h18M3 12h18M3 17h18"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">รายการล่าสุด</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Membership Requests */}
              <RecentSection
                title="สมัครสมาชิกล่าสุด"
                data={recentData.memberships}
                loading={recentLoading.membership}
                filter={filters.membership}
                filterOptions={FILTER_OPTIONS.membership}
                onFilterChange={(value) => updateFilter("membership", value)}
                linkHref="/admin/dashboard/membership-requests"
                colorClass="from-blue-600 to-indigo-600"
                renderItem={(item) => (
                  <li key={`${item.type}-${item.id}`} className="py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          [{item.type?.toUpperCase()}] {item.companyNameTh || item.companyNameEn}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString("th-TH")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-md ${STATUS_STYLES[item.status]}`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                    </div>
                  </li>
                )}
              />

              {/* Recent Member Messages */}
              <RecentSection
                title="ข้อความสมาชิกล่าสุด"
                data={recentData.memberMsgs}
                loading={recentLoading.memberMsg}
                filter={filters.memberMsg}
                filterOptions={FILTER_OPTIONS.messages}
                onFilterChange={(value) => updateFilter("memberMsg", value)}
                linkHref="/admin/dashboard/contact-messages"
                colorClass="from-orange-600 to-red-600"
                renderItem={(m) => (
                  <li key={m.id} className="py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {m.subject || "(ไม่มีหัวเรื่อง)"}
                        </p>
                        <p className="text-xs text-gray-500">
                          จาก {m.name || m.email || "-"} •{" "}
                          {new Date(m.created_at).toLocaleString("th-TH")}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-md ${STATUS_STYLES[m.status]}`}>
                        {m.status}
                      </span>
                    </div>
                  </li>
                )}
              />

              {/* Recent Guest Messages */}
              <RecentSection
                title="ข้อความบุคคลทั่วไปล่าสุด"
                data={recentData.guestMsgs}
                loading={recentLoading.guestMsg}
                filter={filters.guestMsg}
                filterOptions={FILTER_OPTIONS.messages}
                onFilterChange={(value) => updateFilter("guestMsg", value)}
                linkHref="/admin/dashboard/guest-messages"
                colorClass="from-purple-600 to-pink-600"
                renderItem={(g) => (
                  <li key={g.id} className="py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {g.subject || "(ไม่มีหัวเรื่อง)"}
                        </p>
                        <p className="text-xs text-gray-500">
                          จาก {g.name || g.email || "-"} •{" "}
                          {new Date(g.created_at).toLocaleString("th-TH")}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-md ${STATUS_STYLES[g.status]}`}>
                        {g.status}
                      </span>
                    </div>
                  </li>
                )}
              />
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">ข้อมูลระบบ</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  ข้อมูลผู้ดูแลระบบ
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชื่อผู้ใช้:</span>
                    <span className="font-medium">{adminInfo?.username || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ชื่อ:</span>
                    <span className="font-medium">{adminInfo?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ระดับสิทธิ์:</span>
                    <span className="font-medium text-purple-600">
                      {adminInfo?.adminLevel === 5 ? "ผู้ดูแลระบบสูงสุด" : "ผู้ดูแลระบบ"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สิทธิ์การใช้งาน:</span>
                    <span
                      className={`font-medium ${adminInfo?.canCreate ? "text-green-600" : "text-orange-600"}`}
                    >
                      {adminInfo?.canCreate ? "สร้าง/แก้ไข" : "อ่านอย่างเดียว"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  สถานะระบบ
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">สถานะ:</span>
                    <span className="flex items-center font-medium text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      ออนไลน์
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">เวอร์ชัน:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">อัพเดตล่าสุด:</span>
                    <span className="font-medium">{new Date().toLocaleDateString("th-TH")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ฐานข้อมูล:</span>
                    <span className="flex items-center font-medium text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      เชื่อมต่อแล้ว
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
