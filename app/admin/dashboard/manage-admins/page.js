"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";

/**
 * Admin Management Page
 *
 * This component provides functionality for managing admin FTI_Portal_User including:
 * - Viewing all admin accounts
 * - Creating new admin accounts with specific permission levels
 * - Activating/deactivating existing admin accounts
 *
 * Only accessible to admin FTI_Portal_User with level 5 (SuperAdmin) permissions.
 */

export default function ManageAdminsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    adminLevel: 1,
    canCreate: false,
    canUpdate: false,
  });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    adminLevel: 1,
    canCreate: false,
    canUpdate: false,
  });

  // Fetch admin FTI_Portal_User when component mounts
  useEffect(() => {
    fetchAdmins();
  }, []);

  /**
   * Fetches the list of all admin FTI_Portal_User from the API
   * Handles authentication, loading states, and error handling
   */
  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/list-admins");

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("กรุณาเข้าสู่ระบบ");
          router.push("/admin");
          return;
        }
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();

      if (result.success) {
        setAdmins(result.data);
      } else {
        toast.error(result.message || "ไม่สามารถดึงข้อมูลได้");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password by re-inviting (deletes account and sends invite email)
  const handleResetPassword = async (adminId) => {
    if (!confirm("ต้องการรีเซ็ทรหัสผ่านและส่งอีเมลเชิญใหม่ให้ผู้ใช้นี้หรือไม่?")) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/reset-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "รีเซ็ทรหัสผ่านไม่สำเร็จ");
        return;
      }
      toast.success("รีเซ็ทรหัสผ่านและส่งอีเมลเชิญใหม่แล้ว");
      fetchAdmins();
    } catch (err) {
      console.error("reset password error:", err);
      toast.error("เกิดข้อผิดพลาดในการรีเซ็ทรหัสผ่าน");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (!confirm("ยืนยันการลบผู้ดูแลระบบนี้?")) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/delete-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "ลบผู้ดูแลระบบไม่สำเร็จ");
        return;
      }
      toast.success("ลบผู้ดูแลระบบเรียบร้อยแล้ว");
      fetchAdmins();
    } catch (err) {
      console.error("delete admin error:", err);
      toast.error("เกิดข้อผิดพลาดในการลบผู้ดูแลระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form input changes for creating a new admin
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle invite form change
  const handleInviteChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInviteForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Handles the submission of the create admin form
   * Validates inputs and sends request to create a new admin user
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    // Validate password (must be 6 digits)
    if (!/^\d{6}$/.test(formData.password)) {
      toast.error("รหัสผ่านต้องเป็นตัวเลข 6 หลักเท่านั้น");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("สร้างผู้ดูแลระบบใหม่เรียบร้อยแล้ว");
        setShowCreateModal(false);
        setFormData({
          username: "",
          password: "",
          adminLevel: 1,
          canCreate: false,
          canUpdate: false,
        });
        fetchAdmins();
      } else {
        toast.error(result.message || "ไม่สามารถสร้างผู้ดูแลระบบได้");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างผู้ดูแลระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggles the active status of an admin user
   * @param {number} adminId - The ID of the admin to toggle status for
   * @param {boolean} isActive - The current active status of the admin
   */
  const handleToggleActive = async (adminId, isActive) => {
    try {
      const response = await fetch("/api/admin/toggle-admin-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId,
          isActive: !isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${!isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}ผู้ดูแลระบบเรียบร้อยแล้ว`);
        fetchAdmins();
      } else {
        toast.error(result.message || "ไม่สามารถเปลี่ยนสถานะผู้ดูแลระบบได้");
      }
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ดูแลระบบ");
    }
  };

  /**
   * Opens the modal for creating a new admin user
   */
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const openInviteModal = () => {
    setShowInviteModal(true);
  };

  /**
   * Closes the create admin modal and resets the form data
   */
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      username: "",
      password: "",
      adminLevel: 1,
      canCreate: false,
      canUpdate: false,
    });
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteForm({
      email: "",
      adminLevel: 1,
      canCreate: false,
      canUpdate: false,
    });
  };

  // Helper to render initials for avatar
  const getInitials = (name, username) => {
    const base = (name && String(name).trim()) || (username && String(username).trim()) || "";
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Submit invite
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inviteForm.email || !emailRegex.test(inviteForm.email)) {
      toast.error("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/invite-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteForm.email,
          adminLevel: Number(inviteForm.adminLevel),
          canCreate: !!inviteForm.canCreate,
          canUpdate: !!inviteForm.canUpdate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "ส่งคำเชิญไม่สำเร็จ");
        return;
      }
      toast.success("ส่งคำเชิญเรียบร้อยแล้ว");
      closeInviteModal();
    } catch (err) {
      console.error("Invite admin error:", err);
      toast.error("เกิดข้อผิดพลาดในการส่งคำเชิญ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">จัดการผู้ดูแลระบบ</h2>
          <div className="flex gap-2">
            <button
              onClick={openInviteModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ส่งคำเชิญผู้ดูแลระบบ
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">ไม่มีข้อมูลผู้ดูแลระบบ</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
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
                    ชื่อ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ระดับ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สิทธิ์การสร้าง
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สิทธิ์การแก้ไข
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
                    วันที่สร้าง
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                          {getInitials(admin.name, admin.username)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-xs text-gray-500">{admin.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{admin.admin_level}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {admin.can_create ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            มี
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ไม่มี
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {admin.can_update ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            มี
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ไม่มี
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {admin.is_active ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            เปิดใช้งาน
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ปิดใช้งาน
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(admin.created_at).toLocaleDateString("th-TH")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {admin.admin_level < 5 && (
                        <>
                          <button
                            onClick={() => handleToggleActive(admin.id, admin.is_active)}
                            className={`text-sm ${admin.is_active ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-900"}`}
                          >
                            {admin.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                          </button>
                          <button
                            onClick={() => handleResetPassword(admin.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            รีเซ็ทรหัสผ่าน
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            ลบ
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">เพิ่มผู้ดูแลระบบใหม่</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    ชื่อผู้ใช้
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    รหัสผ่าน (ตัวเลข 6 หลัก)
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    รหัสผ่านต้องเป็นตัวเลข 6 หลักเท่านั้น
                  </p>
                </div>

                <div>
                  <label htmlFor="adminLevel" className="block text-sm font-medium text-gray-700">
                    ระดับผู้ดูแลระบบ (1-4)
                  </label>
                  <select
                    id="adminLevel"
                    name="adminLevel"
                    value={formData.adminLevel}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={1}>1 - ระดับพื้นฐาน</option>
                    <option value={2}>2 - ระดับกลาง</option>
                    <option value={3}>3 - ระดับสูง</option>
                    <option value={4}>4 - ระดับผู้จัดการ</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canCreate"
                    name="canCreate"
                    checked={formData.canCreate}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canCreate" className="ml-2 block text-sm text-gray-700">
                    สามารถสร้างข้อมูลได้
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canUpdate"
                    name="canUpdate"
                    checked={formData.canUpdate}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canUpdate" className="ml-2 block text-sm text-gray-700">
                    สามารถแก้ไขข้อมูลได้
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? "กำลังดำเนินการ..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">ส่งคำเชิญผู้ดูแลระบบ</h3>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    อีเมลผู้รับเชิญ
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={inviteForm.email}
                    onChange={handleInviteChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="adminLevelInvite"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ระดับผู้ดูแลระบบ (1-4)
                  </label>
                  <select
                    id="adminLevelInvite"
                    name="adminLevel"
                    value={inviteForm.adminLevel}
                    onChange={handleInviteChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={1}>1 - ระดับพื้นฐาน</option>
                    <option value={2}>2 - ระดับกลาง</option>
                    <option value={3}>3 - ระดับสูง</option>
                    <option value={4}>4 - ระดับผู้จัดการ</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canCreateInvite"
                    name="canCreate"
                    checked={inviteForm.canCreate}
                    onChange={handleInviteChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canCreateInvite" className="ml-2 block text-sm text-gray-700">
                    สามารถสร้างข้อมูลได้
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canUpdateInvite"
                    name="canUpdate"
                    checked={inviteForm.canUpdate}
                    onChange={handleInviteChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canUpdateInvite" className="ml-2 block text-sm text-gray-700">
                    สามารถแก้ไขข้อมูลได้
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  ระบบจะส่งอีเมลพร้อมลิงก์ให้ผู้รับเชิญตั้งรหัสผ่านด้วยตนเอง
                  (รหัสผ่านต้องมีความซับซ้อนตามนโยบาย)
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? "กำลังส่ง..." : "ส่งคำเชิญ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
