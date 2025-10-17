"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const passwordPolicy = {
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  message:
    "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ",
};

export default function AcceptAdminInvitePage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("ไม่พบโทเคน");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/admin/invite/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.message || "โทเคนไม่ถูกต้องหรือหมดอายุ");
        } else {
          setInvite(data.data);
        }
      } catch (e) {
        console.error(e);
        setError("เกิดข้อผิดพลาดในการตรวจสอบโทเคน");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const validatePassword = () => passwordPolicy.regex.test(password);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("กรุณาระบุชื่อผู้ดูแลระบบ");
      return;
    }
    if (trimmedName.length > 100) {
      setError("ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร)");
      return;
    }

    if (!validatePassword()) {
      setError(passwordPolicy.message);
      return;
    }
    if (password !== confirm) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/invite/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name: trimmedName }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "ไม่สามารถสร้างบัญชีได้");
      } else {
        setSuccess("ตั้งรหัสผ่านสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบผู้ดูแลระบบ...");
        // Redirect to external admin login with email prefilled via query param (if supported there)
        try {
          const emailParam = encodeURIComponent(invite?.email || "");
          setTimeout(() => {
            window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/admin?email=${emailParam}`;
          }, 1500);
        } catch (redirectErr) {
          console.error("Redirect error:", redirectErr);
        }
      }
    } catch (e) {
      console.error(e);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 text-blue-700">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <p className="text-sm font-medium">กำลังตรวจสอบโทเคน...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
              <h1 className="text-2xl font-bold mb-2 text-gray-800">คำเชิญไม่ถูกต้อง</h1>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h1 className="text-2xl font-bold mb-1 text-gray-900">ยอมรับคำเชิญเป็นผู้ดูแลระบบ</h1>
            <p className="text-sm text-gray-500 mb-4">ตั้งรหัสผ่านสำหรับบัญชีผู้ดูแลของคุณ</p>

            {invite && (
              <div className="mb-4 p-3 rounded-lg border border-blue-100 bg-blue-50 text-sm text-blue-900">
                <p>
                  <span className="font-semibold">อีเมล:</span> {invite.email}
                </p>
                <p>
                  <span className="font-semibold">ระดับสิทธิ์:</span> Admin Level{" "}
                  {invite.adminLevel}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-3 text-sm px-3 py-2 rounded border border-red-200 bg-red-50 text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 text-sm px-3 py-2 rounded border border-green-200 bg-green-50 text-green-700">
                {success}
              </div>
            )}

            {!success && (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ชื่อผู้ดูแลระบบ</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ระบุชื่อ-นามสกุล"
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">รหัสผ่านใหม่</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        // eye-off icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.91 7.244 19 12 19c1.518 0 2.964-.282 4.285-.795M6.228 6.228A10.45 10.45 0 0112 5c4.756 0 8.774 3.09 10.066 7-.463 1.384-1.245 2.63-2.27 3.672M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65M9.88 9.88a3 3 0 104.24 4.24"
                          />
                        </svg>
                      ) : (
                        // eye icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.207.07.437 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{passwordPolicy.message}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ยืนยันรหัสผ่าน</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="********"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showConfirm ? "ซ่อนยืนยันรหัสผ่าน" : "แสดงยืนยันรหัสผ่าน"}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showConfirm ? (
                        // eye-off icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.91 7.244 19 12 19c1.518 0 2.964-.282 4.285-.795M6.228 6.228A10.45 10.45 0 0112 5c4.756 0 8.774 3.09 10.066 7-.463 1.384-1.245 2.63-2.27 3.672M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65M9.88 9.88a3 3 0 104.24 4.24"
                          />
                        </svg>
                      ) : (
                        // eye icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.07.207.07.437 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  {submitting ? "กำลังบันทึก..." : "ตั้งรหัสผ่านและเปิดใช้งาน"}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  ลิงก์คำเชิญนี้มีอายุ 24 ชั่วโมงเพื่อความปลอดภัย
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
