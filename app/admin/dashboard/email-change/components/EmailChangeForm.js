"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import EmailHistory from "./EmailHistory";

/**
 * EmailChangeForm Component
 *
 * Form for admins to change a user's email address after verifying their identity.
 * This is used when FTI_Portal_User have lost access to their original email.
 */
export default function EmailChangeForm({ user, onBack }) {
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
    <div className="space-y-6">
      {/* User Information Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
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
          <h3 className="text-lg font-bold text-gray-800">ข้อมูลผู้ใช้</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
              ชื่อผู้ใช้
            </p>
            <p className="font-semibold text-gray-900">{user.name}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
              อีเมลปัจจุบัน
            </p>
            <p className="font-semibold text-gray-900 truncate">{user.email}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
              เบอร์โทรศัพท์
            </p>
            <p className="font-semibold text-gray-900">{user.phone || "-"}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">สถานะ</p>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.status === "active"
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                    : user.status === "inactive"
                      ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200"
                      : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200"
                }`}
              >
                {user.status === "active"
                  ? "✓ ใช้งาน"
                  : user.status === "inactive"
                    ? "✗ ไม่ใช้งาน"
                    : "⏳ รอยืนยัน"}
              </span>
              {user.email_verified === 0 && (
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                  ⚠ ยังไม่ยืนยันอีเมล
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {emailSent ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border-2 border-green-200 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">ส่งอีเมลยืนยันสำเร็จ!</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            อีเมลยืนยันได้ถูกส่งไปยัง{" "}
            <span className="font-semibold text-gray-800">{formData.newEmail}</span> เรียบร้อยแล้ว
            <br />
            <span className="text-sm">
              ผู้ใช้จะต้องคลิกลิงก์ยืนยันในอีเมลและตั้งรหัสผ่านใหม่เพื่อเสร็จสิ้นกระบวนการ
            </span>
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            กลับไปยังรายการผู้ใช้
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">เปลี่ยนอีเมลผู้ใช้</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="newEmail"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  อีเมลใหม่ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="newEmail"
                    name="newEmail"
                    value={formData.newEmail}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmNewEmail"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  ยืนยันอีเมลใหม่ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="confirmNewEmail"
                    name="confirmNewEmail"
                    value={formData.confirmNewEmail}
                    onChange={handleChange}
                    placeholder="ยืนยันอีเมลอีกครั้ง"
                    className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="adminNote"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  บันทึกของผู้ดูแลระบบ <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    (จะไม่แสดงต่อผู้ใช้)
                  </span>
                </label>
                <textarea
                  id="adminNote"
                  name="adminNote"
                  value={formData.adminNote}
                  onChange={handleChange}
                  rows="4"
                  placeholder="ระบุวิธีการยืนยันตัวตนของผู้ใช้ก่อนการเปลี่ยนอีเมล เช่น 'ยืนยันตัวตนผ่านโทรศัพท์ และตรวจสอบข้อมูลส่วนตัวแล้ว'"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-200 shadow-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-yellow-900 mb-2">
                  ⚠ สิ่งที่จะเกิดขึ้นเมื่อเปลี่ยนอีเมล
                </h4>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>ส่งอีเมลยืนยันไปยังอีเมลใหม่</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>ส่งอีเมลแจ้งเตือนไปยังอีเมลเดิม</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>ผู้ใช้จะต้องตั้งรหัสผ่านใหม่หลังจากยืนยันอีเมล</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>บันทึกการเปลี่ยนแปลงจะถูกเก็บไว้ในประวัติการใช้งาน</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-md hover:shadow-lg ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  เปลี่ยนอีเมลและส่งอีเมลยืนยัน
                </span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Show email change history */}
      {user && user.id && <EmailHistory userId={user.id} />}
    </div>
  );
}
