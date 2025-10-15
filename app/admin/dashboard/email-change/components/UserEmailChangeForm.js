"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import UserEmailHistory from "./UserEmailHistory";

/**
 * UserEmailChangeForm Component
 *
 * Form for admins to change a user's email address after verifying their identity.
 * This is used when FTI_Portal_User have lost access to their original email.
 */
export default function UserEmailChangeForm({ user, onBack }) {
  const [formData, setFormData] = useState({
    newEmail: "",
    confirmNewEmail: "",
    adminNote: "",
  });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error state
    setError("");

    // Validate inputs
    if (!formData.newEmail || !formData.confirmNewEmail) {
      toast.error("กรุณากรอกอีเมลใหม่และยืนยันอีเมลใหม่");
      return;
    }

    if (formData.newEmail !== formData.confirmNewEmail) {
      toast.error("อีเมลใหม่และยืนยันอีเมลใหม่ไม่ตรงกัน");
      return;
    }

    if (formData.newEmail === user.email) {
      toast.error("อีเมลใหม่ต้องไม่ซ้ำกับอีเมลเดิม");
      return;
    }

    if (!formData.adminNote) {
      toast.error("กรุณาระบุบันทึกของผู้ดูแลระบบ");
      return;
    }

    try {
      setLoading(true);

      // Call API to initiate email change
      const response = await fetch("/api/admin/change-user-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          oldEmail: user.email,
          newEmail: formData.newEmail,
          adminNote: formData.adminNote,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("ส่งอีเมลยืนยันไปยังอีเมลใหม่เรียบร้อยแล้ว");
        setEmailSent(true);
      } else {
        const errorMessage = result.message || "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error changing email:", error);
      const errorMessage = "เกิดข้อผิดพลาดในการเปลี่ยนอีเมล";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Error notification in top-right corner */}
      {error && (
        <div
          className="absolute top-0 right-0 mt-4 mr-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10 shadow-md"
          role="alert"
        >
          <div className="flex">
            <div>
              <p className="font-bold">ข้อผิดพลาด</p>
              <p>{error}</p>
            </div>
            <button onClick={() => setError("")} className="ml-4" aria-label="ปิด">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 8.586l4.293-4.293a1 1 0 0 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 1.414-1.414L10 8.586z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* User Information */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 mb-2">ข้อมูลผู้ใช้</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">ชื่อผู้ใช้:</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">อีเมลปัจจุบัน:</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">เบอร์โทรศัพท์:</p>
            <p className="font-medium">{user.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">สถานะ:</p>
            <p className="font-medium">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : user.status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {user.status === "active"
                  ? "ใช้งาน"
                  : user.status === "inactive"
                    ? "ไม่ใช้งาน"
                    : "รอยืนยัน"}
              </span>
              {user.email_verified === 0 && (
                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  ยังไม่ยืนยันอีเมล
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {emailSent ? (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-green-500 mb-4"
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
          <h3 className="text-lg font-medium text-green-800 mb-2">
            อีเมลยืนยันถูกส่งเรียบร้อยแล้ว
          </h3>
          <p className="text-green-600 mb-4">
            อีเมลยืนยันได้ถูกส่งไปยัง {formData.newEmail} เรียบร้อยแล้ว
            <br />
            ผู้ใช้จะต้องคลิกลิงก์ยืนยันในอีเมลและตั้งรหัสผ่านใหม่เพื่อเสร็จสิ้นกระบวนการ
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              กลับไปยังรายการผู้ใช้
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">เปลี่ยนอีเมลผู้ใช้</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                อีเมลใหม่
              </label>
              <input
                type="email"
                id="newEmail"
                name="newEmail"
                value={formData.newEmail}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmNewEmail" className="block text-sm font-medium text-gray-700">
                ยืนยันอีเมลใหม่
              </label>
              <input
                type="email"
                id="confirmNewEmail"
                name="confirmNewEmail"
                value={formData.confirmNewEmail}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="adminNote" className="block text-sm font-medium text-gray-700">
                บันทึกของผู้ดูแลระบบ (จะไม่แสดงต่อผู้ใช้)
              </label>
              <textarea
                id="adminNote"
                name="adminNote"
                value={formData.adminNote}
                onChange={handleChange}
                rows="3"
                placeholder="ระบุวิธีการยืนยันตัวตนของผู้ใช้ก่อนการเปลี่ยนอีเมล เช่น 'ยืนยันตัวตนผ่านโทรศัพท์ และตรวจสอบข้อมูลส่วนตัวแล้ว'"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">คำเตือน</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>การเปลี่ยนอีเมลจะทำให้:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>ส่งอีเมลยืนยันไปยังอีเมลใหม่</li>
                    <li>ส่งอีเมลแจ้งเตือนไปยังอีเมลเดิม</li>
                    <li>ผู้ใช้จะต้องตั้งรหัสผ่านใหม่หลังจากยืนยันอีเมล</li>
                    <li>บันทึกการเปลี่ยนแปลงจะถูกเก็บไว้ในประวัติการใช้งาน</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังดำเนินการ...
                </span>
              ) : (
                "เปลี่ยนอีเมลและส่งอีเมลยืนยัน"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Show email change history */}
      {user && user.id && <UserEmailHistory userId={user.id} />}
    </div>
  );
}
