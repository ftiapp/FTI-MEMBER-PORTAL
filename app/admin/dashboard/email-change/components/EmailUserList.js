"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { TrashIcon, UserIcon } from "@heroicons/react/24/outline";

/**
 * EmailUserList Component
 *
 * Displays a list of FTI_Portal_User with search functionality for admins to select
 * a user for email change.
 */
export default function EmailUserList({ onSelectUser, onRefreshStats }) {
  const [FTI_Portal_User, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'verified', 'unverified'
  const usersPerPage = 10;

  // Fetch FTI_Portal_User on component mount
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage]);

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/FTI_Portal_User/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        if (onRefreshStats) onRefreshStats();
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch FTI_Portal_User from the API
  const fetchUsers = async (searchParam = "") => {
    try {
      setLoading(true);
      const searchQuery = searchParam ? `&search=${encodeURIComponent(searchParam)}` : "";
      const response = await fetch(
        `/api/admin/FTI_Portal_User?page=${currentPage}&limit=${usersPerPage}${searchQuery}`,
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.FTI_Portal_User);
        setFilteredUsers(data.FTI_Portal_User);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.message || "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      }
    } catch (error) {
      console.error("Error fetching FTI_Portal_User:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setCurrentPage(1);
      fetchUsers();
      fetchStats();
    }
  };

  // Handle search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (searchTerm.trim() === "") {
      setCurrentPage(1);
      fetchUsers();
      fetchStats();
      return;
    }

    fetchUsers(searchTerm.trim());
  };

  // Handle delete user
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`คุณต้องการลบผู้ใช้ "${user.name}" ใช่หรือไม่?\n\nอีเมล: ${user.email}`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/FTI_Portal_User/delete/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchUsers();
        fetchStats();
      } else {
        toast.error(data.message || "ไม่สามารถลบผู้ใช้ได้");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Filter users based on status
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (status === "all") {
      setFilteredUsers(FTI_Portal_User);
    } else if (status === "verified") {
      setFilteredUsers(FTI_Portal_User.filter((u) => u.email_verified === 1));
    } else if (status === "unverified") {
      setFilteredUsers(FTI_Portal_User.filter((u) => u.email_verified !== 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือเบอร์โทรศัพท์..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          ค้นหา
        </button>
      </form>

      {/* Status Filter */}
      <div className="flex gap-2 bg-gray-50 p-2 rounded-lg">
        <button
          onClick={() => handleFilterChange("all")}
          className={`flex-1 py-2 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
            filterStatus === "all"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
              : "text-gray-600 hover:bg-white hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            ทั้งหมด ({FTI_Portal_User.length})
          </div>
        </button>
        <button
          onClick={() => handleFilterChange("verified")}
          className={`flex-1 py-2 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
            filterStatus === "verified"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
              : "text-gray-600 hover:bg-white hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ยืนยันแล้ว ({stats.verified})
          </div>
        </button>
        <button
          onClick={() => handleFilterChange("unverified")}
          className={`flex-1 py-2 px-4 font-medium text-sm rounded-lg transition-all duration-200 ${
            filterStatus === "unverified"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
              : "text-gray-600 hover:bg-white hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            ยังไม่ยืนยัน ({stats.unverified})
          </div>
        </button>
      </div>

      {/* FTI_Portal_User Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ชื่อผู้ใช้
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  อีเมล
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  เบอร์โทรศัพท์
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  การกระทำ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500 mb-3"></div>
                      <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-gray-500 font-medium">ไม่พบข้อมูลผู้ใช้</p>
                      <p className="text-gray-400 text-sm mt-1">
                        ลองค้นหาด้วยคำค้นอื่นหรือเปลี่ยนตัวกรอง
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{user.phone || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.email_verified === 1
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                            : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                        }`}
                      >
                        {user.email_verified === 1 ? "✓ ยืนยันแล้ว" : "⏳ ยังไม่ยืนยัน"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectUser(user)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="เลือกเพื่อเปลี่ยนอีเมล"
                        >
                          <UserIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="ลบผู้ใช้"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400 shadow-sm"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400 shadow-sm"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {!loading && filteredUsers.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          แสดงผลลัพธ์ {(currentPage - 1) * usersPerPage + 1} -{" "}
          {Math.min(currentPage * usersPerPage, stats.total)} จากทั้งหมด {stats.total} ผู้ใช้
        </div>
      )}
    </div>
  );
}
