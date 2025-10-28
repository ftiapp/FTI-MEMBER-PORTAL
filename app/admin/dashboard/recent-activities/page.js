"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import toast from "react-hot-toast";
import FilterPanel from "./components/FilterPanel";
import ActivityList from "./components/ActivityList";
import Pagination from "./components/Pagination";
import { useActivities } from "./hooks/useActivities";

export default function RecentActivities() {
  const router = useRouter();
    const {
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
  } = useActivities();

  // ตรวจสอบสิทธิ์ Super Admin (admin_level 5)
  useEffect(() => {
    async function checkAdminLevel() {
      try {
        const res = await fetch("/api/admin/check-session", {
          cache: "no-store",
          next: { revalidate: 0 },
        });
        const data = await res.json();

        if (data.success && data.admin) {
          // ถ้าไม่ใช่ Super Admin (admin_level 5) ให้ redirect กลับไปหน้า dashboard
          if (data.admin.admin_level < 5) {
            toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะ Super Admin เท่านั้น");
            router.push("/admin/dashboard");
          }
        } else {
          // ถ้าไม่มีข้อมูล admin ให้ redirect ไปหน้า login
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error checking admin level:", error);
        toast.error("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์");
        router.push("/admin/dashboard");
      }
    }

    checkAdminLevel();
  }, [router]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  return (
    <AdminLayout>
      <motion.div
        className="space-y-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <motion.h1
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            กิจกรรมของแอดมิน
          </motion.h1>

          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-colors ${
                showFilters || hasActiveFilters()
                  ? "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
              ตัวกรอง
              {hasActiveFilters() && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  กำลังใช้งาน
                </span>
              )}
            </button>

            <button
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              รีเฟรช
            </button>
          </motion.div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          showFilters={showFilters}
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Activity List */}
        <ActivityList
          activities={activities}
          loading={loading}
          error={error}
          onRefresh={refreshData}
        />

        {/* Pagination */}
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          activitiesCount={activities.length}
        />
      </motion.div>
    </AdminLayout>
  );
}
