"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle', 'submitting', 'success', 'error'
  const [message, setMessage] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [requiresRegistration, setRequiresRegistration] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("กรุณากรอกอีเมล");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 404 for non-existent email differently
        if (response.status === 404 && data.requiresRegistration) {
          setStatus("success");
          setMessage(data.error);
          setRequiresRegistration(true);
          return;
        }
        throw new Error(data.error || "เกิดข้อผิดพลาดในการดำเนินการ");
      }

      setStatus("success");
      setMessage(data.message);
      setRequiresRegistration(data.requiresRegistration || false);
      if (data.remainingAttempts !== undefined) {
        setRemainingAttempts(data.remainingAttempts);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold">ลืมรหัสผ่าน</h2>
              <p className="text-blue-100 mt-1">กรอกอีเมลของคุณเพื่อตรวจสอบและรีเซ็ตรหัสผ่าน</p>
            </div>

            <div className="p-6">
              {status === "success" ? (
                <div className="space-y-6">
                  <div
                    className={`p-4 border rounded-lg ${requiresRegistration ? "bg-orange-50 border-orange-100 text-orange-600" : "bg-green-50 border-green-100 text-green-600"}`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className={`h-5 w-5 ${requiresRegistration ? "text-orange-500" : "text-green-500"}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          {requiresRegistration ? (
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{message}</p>
                        {remainingAttempts !== null && !requiresRegistration && (
                          <p className="text-sm mt-1">
                            คุณสามารถขอรีเซ็ตรหัสผ่านได้อีก {remainingAttempts} ครั้งในวันนี้
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    {requiresRegistration ? (
                      <>
                        <Link
                          href="/register"
                          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors"
                        >
                          สมัครสมาชิกเว็บไซต์
                        </Link>
                        <div>
                          <Link
                            href="/login"
                            className="text-blue-700 hover:text-blue-600 font-semibold text-sm"
                          >
                            กลับไปหน้าเข้าสู่ระบบ
                          </Link>
                        </div>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors"
                      >
                        กลับไปหน้าเข้าสู่ระบบ
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === "error" && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                      {message}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="email@example.com"
                      disabled={status === "submitting"}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className={`w-full px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 ${
                      status === "submitting" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {status === "submitting" ? "กำลังดำเนินการ..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                  </button>

                  <div className="text-center mt-4">
                    <Link href="/login" className="text-blue-700 hover:text-blue-600 font-semibold">
                      กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
