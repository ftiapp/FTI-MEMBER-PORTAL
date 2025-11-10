"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import EmailUserList from "./components/EmailUserList";
import EmailChangeForm from "./components/EmailChangeForm";

/**
 * Admin Email Change Management
 *
 * This component allows admins to change emails for FTI_Portal_User who have lost access
 * to their original email address after verifying their identity through external means.
 */
export default function EmailChangePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });

  // Fetch user details if userId is provided in the URL
  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
    fetchStats();
  }, [userId]);

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/FTI_Portal_User/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch user details by ID
  const fetchUserDetails = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/FTI_Portal_User/${id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedUser(data.user);
      } else {
        console.error("Error fetching user details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection from the list
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Update URL with selected user ID for bookmarking/sharing
    router.push(`/admin/dashboard/email-change?userId=${user.id}`, undefined, { scroll: false });
  };

  // Clear selected user and return to list view
  const handleBackToList = () => {
    setSelectedUser(null);
    fetchStats(); // Refresh stats when going back
    router.push("/admin/dashboard/email-change", undefined, { scroll: false });
  };

  if (loading && userId) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#1e3a8a]"></div>
          <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-200"
      >
        {/* Header with gradient */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg
              className="w-7 h-7 text-[#1e3a8a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {selectedUser ? "เปลี่ยนอีเมลผู้ใช้" : "จัดการเปลี่ยนอีเมลผู้ใช้"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            สำหรับผู้ใช้ที่ไม่สามารถเข้าถึงอีเมลเดิมได้ (ลืมรหัสผ่านอีเมล, อีเมลถูกยกเลิก, ฯลฯ)
          </p>
        </div>

        {/* Status Cards - Only show in list view */}
        {!selectedUser && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    ผู้ใช้ทั้งหมด
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="p-3 rounded-full bg-blue-500">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    ยืนยันอีเมลแล้ว
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.verified}</div>
                </div>
                <div className="p-3 rounded-full bg-green-500">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    ยังไม่ยืนยัน
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.unverified}</div>
                </div>
                <div className="p-3 rounded-full bg-yellow-500">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back button for form view */}
        {selectedUser && (
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              กลับไปรายการผู้ใช้
            </button>
          </div>
        )}

        {/* Content Area */}
        {selectedUser ? (
          <EmailChangeForm user={selectedUser} onBack={handleBackToList} />
        ) : (
          <EmailUserList onSelectUser={handleUserSelect} onRefreshStats={fetchStats} />
        )}
      </motion.div>
    </AdminLayout>
  );
}
