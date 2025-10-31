"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * Alluser Component
 *
 * Displays a paginated table of all FTI_Portal_User with their login statistics
 * Shows name, email, phone, and login count with 5 FTI_Portal_User per page
 */
export default function Alluser() {
  const [FTI_Portal_User, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalActiveUsers: 0,
    totalInactiveUsers: 0,
    totalPendingUsers: 0,
    averageLoginCount: 0,
    mostActiveUser: null,
  });

  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
    fetchUserStats();
  }, [currentPage, searchTerm]);

  /**
   * Fetches paginated user data from the API
   * @param {number} page - The page number to fetch
   * @param {string} search - Optional search term
   */
  const fetchUsers = async (page, search = "") => {
    try {
      setLoading(true);
      let url = `/api/admin/FTI_Portal_User?page=${page}&limit=${usersPerPage}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch FTI_Portal_User");
      }

      const data = await response.json();
      setUsers(data.FTI_Portal_User);
      setTotalPages(data.totalPages);
      setTotalUsers(data.totalUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching FTI_Portal_User:", err);
      setError("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      setLoading(false);
      toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    }
  };

  /**
   * Fetches user statistics for the dashboard
   */
  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/admin/user-stats");

      if (!response.ok) {
        throw new Error("Failed to fetch user statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching user statistics:", err);
      // We don't set error state here to avoid blocking the main table display
      toast.error("ไม่สามารถโหลดข้อมูลสถิติผู้ใช้ได้");
    }
  };

  /**
   * Handles page navigation
   * @param {number} page - The page number to navigate to
   */
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  /**
   * Handles search input changes
   * @param {Event} e - The input change event
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Handles search form submission
   * @param {Event} e - The form submit event
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchUsers(1, searchTerm);
  };

  /**
   * Renders pagination controls
   * @returns {JSX.Element} Pagination component
   */
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
            currentPage === i
              ? "bg-[#1e3a8a] text-white"
              : "bg-white text-[#1e3a8a] border border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
          }`}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="flex justify-center items-center mt-3 sm:mt-4 flex-wrap gap-1 sm:gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-[#1e3a8a] border border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
          }`}
        >
          &laquo; ก่อนหน้า
        </button>

        {pages}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-[#1e3a8a] border border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
          }`}
        >
          ถัดไป &raquo;
        </button>
      </div>
    );
  };

  /**
   * Renders user statistics dashboard
   * @returns {JSX.Element} Statistics component
   */
  const renderStatistics = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-[#1e3a8a] mb-3 sm:mb-4">
          สถิติผู้ใช้งาน
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">จำนวนผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold text-[#1e3a8a]">{stats.totalUsers || 0}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#1e3a8a]"
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
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">ผู้ใช้ที่ใช้งานอยู่</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalActiveUsers}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
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

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">ผู้ใช้รอการยืนยัน</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalPendingUsers}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">ค่าเฉลี่ยการเข้าสู่ระบบ</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.averageLoginCount ? Number(stats.averageLoginCount).toFixed(1) : 0} ครั้ง
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">ผู้ใช้ที่เข้าสู่ระบบมากที่สุด</p>
                <p className="text-xl font-bold text-indigo-600 truncate">
                  {stats.mostActiveUser
                    ? `${stats.mostActiveUser.firstname || ""} ${stats.mostActiveUser.lastname || ""}`.trim() ||
                      "ไม่มีข้อมูล"
                    : "ไม่มีข้อมูล"}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.mostActiveUser ? `${stats.mostActiveUser.login_count} ครั้ง` : ""}
                </p>
              </div>
              <div className="bg-indigo-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600"
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
        </div>
      </div>
    );
  };

  return (
    <div className="p-2 sm:p-4">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-4 sm:mb-6">
        ข้อมูลผู้ใช้ทั้งหมด
      </h2>

      {renderStatistics()}

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="ค้นหาตามชื่อ หรือ นามสกุล..."
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#1e3a8a] text-white rounded-lg hover:bg-[#152b65] transition-colors whitespace-nowrap"
          >
            ค้นหา
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#1e3a8a]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-3 sm:p-4 rounded-lg text-red-600 text-center text-sm sm:text-base">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      ลำดับ
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      ชื่อ - นามสกุล
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      อีเมล
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      เบอร์โทรศัพท์
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      สถานะ
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      จำนวนเข้าสู่ระบบ
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      วันที่สร้าง
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {FTI_Portal_User.length > 0 ? (
                    FTI_Portal_User.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                      >
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-gray-500">
                          {(currentPage - 1) * usersPerPage + index + 1}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {`${user.firstname || ""} ${user.lastname || ""}`.trim() || "-"}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                          <div className="text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                          <div className="text-gray-500">{user.phone || "-"}</div>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : user.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "active"
                              ? "ใช้งาน"
                              : user.status === "pending"
                                ? "รอการยืนยัน"
                                : "ไม่ใช้งาน"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-gray-500">
                          {user.login_count || 0}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-gray-500">
                          {new Date(user.created_at).toLocaleDateString("th-TH")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        ไม่พบข้อมูลผู้ใช้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {FTI_Portal_User.length > 0 && renderPagination()}
        </>
      )}
    </div>
  );
}
