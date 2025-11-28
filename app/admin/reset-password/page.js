"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // ตรวจสอบสิทธิ์แอดมินระดับ 5 ก่อนแสดงหน้า
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check-admin", { cache: "no-store" });
        const data = await res.json();

        // ถ้าไม่ได้ล็อกอินหรือ session หมดอายุ ให้กลับไปหน้า login แอดมิน
        if (res.status === 401) {
          toast.error("กรุณาเข้าสู่ระบบผู้ดูแลก่อนใช้งานหน้าดังกล่าว");
          router.push("/admin");
          return;
        }

        if (!res.ok) {
          throw new Error(data.message || "ไม่สามารถตรวจสอบสิทธิ์แอดมินได้");
        }

        // ต้องเป็นแอดมินระดับ 5 เท่านั้น
        if (!data.adminLevel || data.adminLevel < 5) {
          toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้าตั้งค่ารีเซ็ตรหัสผ่าน Super Admin");
          router.push("/admin/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking admin permission:", error);
        toast.error(error.message || "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์แอดมิน");
        router.push("/admin/dashboard");
        return;
      } finally {
        setIsChecking(false);
      }
    };

    checkAdmin();
  }, [router]);

  const handleResetPassword = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตรหัสผ่าน Super Admin?")) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success("รีเซ็ตรหัสผ่านสำเร็จ");
      } else {
        toast.error(`รีเซ็ตรหัสผ่านล้มเหลว: ${data.message}`);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
    } finally {
      setIsResetting(false);
    }
  };

  // แสดง loading ระหว่างตรวจสอบสิทธิ์
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          รีเซ็ตรหัสผ่าน Super Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">ใช้เฉพาะกรณีฉุกเฉินเท่านั้น</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-700">
                การกดปุ่มด้านล่างจะรีเซ็ตรหัสผ่านของผู้ดูแลระบบระดับสูงสุด (admin_level 5) ทั้งหมด
                ให้เป็นรหัสผ่านเริ่มต้น โปรดใช้ความระมัดระวังในการใช้ฟีเจอร์นี้
              </p>
            </div>

            {result && result.success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">รีเซ็ตรหัสผ่านสำเร็จ</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        รหัสผ่านใหม่:{" "}
                        <strong className="font-mono bg-gray-100 p-1 rounded">
                          {result.newPassword}
                        </strong>
                      </p>
                      <p className="mt-1">โปรดเปลี่ยนรหัสผ่านนี้โดยเร็วที่สุดหลังจากเข้าสู่ระบบ</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result && !result.success && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">รีเซ็ตรหัสผ่านล้มเหลว</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{result.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResetting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isResetting ? "กำลังรีเซ็ตรหัสผ่าน..." : "รีเซ็ตรหัสผ่าน Super Admin"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
