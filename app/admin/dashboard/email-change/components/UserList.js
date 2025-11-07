"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

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
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือเบอร์โทรศัพท์"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ค้นหา
        </button>
      </form>

      {/* FTI_Portal_User Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ชื่อผู้ใช้
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                อีเมล
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                เบอร์โทรศัพท์
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                สถานะ
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                การกระทำ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.phone || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.email_verified === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.email_verified === 1
                        ? "ยืนยันอีเมลแล้ว"
                        : "ยังไม่ยืนยันอีเมล"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onSelectUser(user)}
                      className="text-blue-600 hover:text-blue-900 focus:outline-none"
                    >
                      เลือก
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-l-md border border-gray-300 
                ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border-t border-b border-gray-300 
                  ${currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-r-md border border-gray-300 
                ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              ถัดไป
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
