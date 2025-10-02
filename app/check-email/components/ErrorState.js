import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function ErrorState({ errorMessage, setVerificationStatus, email }) {
  const [resendEmail, setResendEmail] = useState(email || "");
  const [isResending, setIsResending] = useState(false);

  // ฟังก์ชันสำหรับส่งอีเมลยืนยันใหม่
  const handleResendVerification = async () => {
    if (!resendEmail) {
      toast.error("กรุณากรอกอีเมลของคุณ");
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ");
        setVerificationStatus("registration_success");
      } else {
        toast.error(data.message || "เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน");
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      className="text-center"
      key="error"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-4">
        <motion.svg
          className="w-16 h-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </motion.svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
      <p className="text-gray-600 mb-2">{errorMessage}</p>
      <p className="text-gray-600 mb-4">หากคุณต้องการความช่วยเหลือ กรุณาติดต่อเจ้าหน้าที่</p>

      {/* เพิ่มฟอร์มสำหรับส่งอีเมลยืนยันใหม่ */}
      <div className="mb-6 max-w-md mx-auto">
        <h4 className="text-lg font-medium text-gray-700 mb-3">ส่งอีเมลยืนยันใหม่</h4>
        <div className="mb-4">
          <input
            type="email"
            placeholder="ระบุอีเมลของคุณ"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-2"
          />
        </div>
        <motion.button
          onClick={handleResendVerification}
          disabled={isResending}
          className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 mb-4 ${isResending ? "opacity-70 cursor-not-allowed" : ""}`}
          whileHover={{ scale: isResending ? 1 : 1.02 }}
          whileTap={{ scale: isResending ? 1 : 0.98 }}
        >
          {isResending ? (
            <span className="flex items-center justify-center">
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
              กำลังส่ง...
            </span>
          ) : (
            "ส่งอีเมลยืนยันใหม่"
          )}
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/register"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 w-full md:w-auto text-center mb-2 md:mb-0"
          >
            ลงทะเบียนใหม่
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 w-full md:w-auto text-center"
          >
            เข้าสู่ระบบ
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
