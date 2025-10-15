"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";

/**
 * Admin Permissions Management Page
 *
 * This component provides functionality for managing admin user permissions including:
 * - Viewing all admin accounts with their current permissions
 * - Updating permissions for existing admin accounts
 *
 * Only accessible to admin FTI_Portal_User with level 5 (SuperAdmin) permissions.
 */

export default function AdminPermissionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canUpdate: false,
    canApprove: false,
    canReject: false,
    canViewLogs: false,
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

  /**
   * Opens the modal for editing admin permissions
   * @param {Object} admin - The admin user object to edit permissions for
   */
  const openPermissionModal = (admin) => {
    setSelectedAdmin(admin);
    setPermissions({
      canCreate: admin.can_create || false,
      canUpdate: admin.can_update || false,
      canApprove: admin.can_approve || false,
      canReject: admin.can_reject || false,
      canViewLogs: admin.can_view_logs || false,
    });
    setShowPermissionModal(true);
  };

  /**
   * Closes the permission modal and resets the selected admin and permissions
   */
  const closePermissionModal = () => {
    setShowPermissionModal(false);
    setSelectedAdmin(null);
    setPermissions({
      canCreate: false,
      canUpdate: false,
      canApprove: false,
      canReject: false,
      canViewLogs: false,
    });
  };

  /**
   * Handles form input changes for updating admin permissions
   * @param {Event} e - The input change event
   */
  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  /**
   * Handles the submission of the update permissions form
   * Sends request to update admin permissions
   * @param {Event} e - The form submission event
   */
  const handleSubmitPermissions = async (e) => {
    e.preventDefault();

    if (!selectedAdmin) {
      toast.error("ไม่พบข้อมูลผู้ดูแลระบบ");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/update-admin-permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: selectedAdmin.id,
          permissions,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("อัปเดตสิทธิ์ผู้ดูแลระบบเรียบร้อยแล้ว");
        setShowPermissionModal(false);
        fetchAdmins();
      } else {
        toast.error(result.message || "ไม่สามารถอัปเดตสิทธิ์ผู้ดูแลระบบได้");
      }
    } catch (error) {
      console.error("Error updating admin permissions:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสิทธิ์ผู้ดูแลระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Renders a permission badge with appropriate color based on permission status
   * @param {boolean} hasPermission - Whether the admin has the permission
   * @param {string} label - The label for the permission
   * @returns {JSX.Element} - The rendered permission badge
   */
  const renderPermissionBadge = (hasPermission, label) => {
    return hasPermission ? (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        {label}
      </span>
    ) : (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
        {label}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">จัดการสิทธิ์แอดมิน</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">ไม่มีข้อมูลผู้ดูแลระบบ</div>
        ) : (
          <div className="overflow-x-auto">
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
                    ระดับ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สิทธิ์การใช้งาน
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
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{admin.admin_level}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {renderPermissionBadge(admin.can_create, "สร้าง")}
                        {renderPermissionBadge(admin.can_update, "แก้ไข")}
                        {renderPermissionBadge(admin.can_approve, "อนุมัติ")}
                        {renderPermissionBadge(admin.can_reject, "ปฏิเสธ")}
                        {renderPermissionBadge(admin.can_view_logs, "ดูบันทึก")}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {admin.admin_level < 5 && (
                        <button
                          onClick={() => openPermissionModal(admin)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          แก้ไขสิทธิ์
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Permissions Modal */}
      {showPermissionModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                แก้ไขสิทธิ์ผู้ดูแลระบบ: {selectedAdmin.username}
              </h3>
            </div>

            <form onSubmit={handleSubmitPermissions}>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canCreate"
                    name="canCreate"
                    checked={permissions.canCreate}
                    onChange={handlePermissionChange}
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
                    checked={permissions.canUpdate}
                    onChange={handlePermissionChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canUpdate" className="ml-2 block text-sm text-gray-700">
                    สามารถแก้ไขข้อมูลได้
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canApprove"
                    name="canApprove"
                    checked={permissions.canApprove}
                    onChange={handlePermissionChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canApprove" className="ml-2 block text-sm text-gray-700">
                    สามารถอนุมัติคำขอได้
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canReject"
                    name="canReject"
                    checked={permissions.canReject}
                    onChange={handlePermissionChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canReject" className="ml-2 block text-sm text-gray-700">
                    สามารถปฏิเสธคำขอได้
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canViewLogs"
                    name="canViewLogs"
                    checked={permissions.canViewLogs}
                    onChange={handlePermissionChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canViewLogs" className="ml-2 block text-sm text-gray-700">
                    สามารถดูบันทึกการทำงานได้
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closePermissionModal}
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
    </AdminLayout>
  );
}
