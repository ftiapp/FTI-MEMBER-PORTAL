"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* User Information Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-blue-900">ข้อมูลผู้ใช้</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ชื่อผู้ใช้
            </p>
            <p className="font-semibold text-gray-800">{user.name}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              อีเมลปัจจุบัน
            </p>
            <p className="font-semibold text-gray-800">{user.email}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              เบอร์โทรศัพท์
            </p>
            <p className="font-semibold text-gray-800">{user.phone || "-"}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 mb-1">สถานะ</p>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : user.status === "inactive"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                }`}
              >
                {user.status === "active" && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {user.status === "active"
                  ? "ใช้งาน"
                  : user.status === "inactive"
                    ? "ไม่ใช้งาน"
                    : "รอยืนยัน"}
              </span>
              {user.email_verified === 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  ยังไม่ยืนยันอีเมล
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {emailSent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border-2 border-green-200 text-center shadow-lg"
        >
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
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
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-3">
            อีเมลยืนยันถูกส่งเรียบร้อยแล้ว
          </h3>
          <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
            <p className="text-green-700 font-medium mb-2">
              อีเมลยืนยันได้ถูกส่งไปยัง
            </p>
            <p className="text-lg font-bold text-green-800">{formData.newEmail}</p>
          </div>
          <div className="text-sm text-green-700 space-y-2 mb-6">
            <p className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ผู้ใช้จะต้องคลิกลิงก์ยืนยันในอีเมล
            </p>
            <p className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              ตั้งรหัสผ่านใหม่เพื่อเสร็จสิ้นกระบวนการ
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            กลับไปยังรายการผู้ใช้
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">เปลี่ยนอีเมลผู้ใช้</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="newEmail" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  อีเมลใหม่
                </label>
                <input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmNewEmail" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ยืนยันอีเมลใหม่
                </label>
                <input
                  type="email"
                  id="confirmNewEmail"
                  name="confirmNewEmail"
                  value={formData.confirmNewEmail}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ยืนยันอีเมลใหม่"
                  required
                />
              </div>

              <div>
                <label htmlFor="adminNote" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  บันทึกของผู้ดูแลระบบ
                  <span className="text-xs text-gray-500 font-normal">(จะไม่แสดงต่อผู้ใช้)</span>
                </label>
                <textarea
                  id="adminNote"
                  name="adminNote"
                  value={formData.adminNote}
                  onChange={handleChange}
                  rows="4"
                  placeholder="ระบุวิธีการยืนยันตัวตนของผู้ใช้ก่อนการเปลี่ยนอีเมล เช่น 'ยืนยันตัวตนผ่านโทรศัพท์ และตรวจสอบข้อมูลส่วนตัวแล้ว'"
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Warning Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-300 shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-yellow-400 rounded-lg">
                  <svg
                    className="h-6 w-6 text-white"
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
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-900 mb-3">คำเตือนสำคัญ</h3>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p className="font-medium">การเปลี่ยนอีเมลจะทำให้:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>ส่งอีเมลยืนยันไปยังอีเมลใหม่</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>ส่งอีเมลแจ้งเตือนไปยังอีเมลเดิม</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>ผู้ใช้จะต้องตั้งรหัสผ่านใหม่หลังจากยืนยันอีเมล</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>บันทึกการเปลี่ยนแปลงจะถูกเก็บไว้ในประวัติการใช้งาน</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-all duration-200"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
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
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  เปลี่ยนอีเมลและส่งอีเมลยืนยัน
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Show email change history */}
      {user && user.id && <UserEmailHistory userId={user.id} />}
    </motion.div>
  );
}