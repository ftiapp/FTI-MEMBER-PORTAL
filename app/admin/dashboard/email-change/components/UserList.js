"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

/**
 * UserList Component
 *
 * Displays a list of FTI_Portal_User with search functionality for admins to select
 * a user for email change.
 */
export default function UserList({ onSelectUser }) {
  const [FTI_Portal_User, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const usersPerPage = 10;

  // Fetch FTI_Portal_User on component mount
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Fetch FTI_Portal_User from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/FTI_Portal_User?page=${currentPage}&limit=${usersPerPage}`,
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.FTI_Portal_User);
        setFilteredUsers(data.FTI_Portal_User);
        setTotal(data.total);
        setTotalPages(Math.ceil(data.total / usersPerPage));
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
      setFilteredUsers(FTI_Portal_User);
    } else {
      const filtered = FTI_Portal_User.filter(
        (user) =>
          user.name?.toLowerCase().includes(value.toLowerCase()) ||
          user.email?.toLowerCase().includes(value.toLowerCase()) ||
          user.phone?.includes(value),
      );
      setFilteredUsers(filtered);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (searchTerm.trim() === "") {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/FTI_Portal_User/search?term=${encodeURIComponent(searchTerm)}`,
      );
      const data = await response.json();

      if (data.success) {
        setFilteredUsers(data.FTI_Portal_User);
        setTotal(data.total);
        setTotalPages(Math.ceil(data.total / usersPerPage));
      } else {
        toast.error(data.message || "ไม่พบผู้ใช้ที่ตรงกับคำค้นหา");
      }
    } catch (error) {
      console.error("Error searching FTI_Portal_User:", error);
      toast.error("เกิดข้อผิดพลาดในการค้นหาผู้ใช้");
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Form - Improved */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          ค้นหา
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  ชื่อผู้ใช้
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  อีเมล
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  เบอร์โทรศัพท์
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  สถานะ
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1e3a8a] mb-3"></div>
                      <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 font-medium">ไม่พบข้อมูลผู้ใช้</p>
                    <p className="text-gray-500 text-sm mt-1">ลองค้นหาด้วยคำค้นอื่น</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`transition-all duration-200 hover:bg-blue-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {user.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                          user.email_verified === 1
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                            : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                        }`}
                      >
                        {user.email_verified === 1 ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {user.email_verified === 1
                          ? "ยืนยันอีเมลแล้ว"
                          : "ยังไม่ยืนยันอีเมล"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onSelectUser(user)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        เลือก
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Improved */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              หน้า <span className="font-bold text-[#1e3a8a]">{currentPage}</span> / {totalPages}
            </div>
            <div className="text-sm text-gray-600">
              ทั้งหมด <span className="font-bold text-[#1e3a8a]">{total}</span> รายการ
            </div>
          </div>
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
              }`}
            >
              «
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
              }`}
            >
              ‹ ก่อนหน้า
            </button>
            
            {/* Page numbers (show max 5 pages) */}
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:from-[#2563eb] hover:to-[#1e3a8a] shadow-sm"
              }`}
            >
              ถัดไป ›
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
              }`}
            >
              »
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}