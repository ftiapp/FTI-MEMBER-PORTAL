"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VerificationContent from "./components/VerificationContent";

export default function CheckEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // กรณีมาจากหน้าลงทะเบียน (มี email แต่ไม่มี token)
    if (email && !token) {
      setVerificationStatus("registration_success");
      setNewEmail(email);
      return;
    }

    // กรณีเข้าหน้านี้โดยตรงโดยไม่มี token
    if (!token) {
      setVerificationStatus("error");
      setErrorMessage("ไม่พบโทเคนยืนยัน กรุณาตรวจสอบลิงก์ในอีเมลของคุณอีกครั้ง");
      return;
    }

    const verifyNewEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          // กรณีเป็นการยืนยันอีเมลปกติ
          if (data.type === "email_verification") {
            setVerificationStatus("success");
            setNewEmail(data.email);
            toast.success("ยืนยันอีเมลสำเร็จ");
          }
          // กรณีเป็นการเปลี่ยนอีเมลที่ต้องตั้งรหัสผ่านใหม่
          else if (data.type === "email_change") {
            setVerificationStatus("password_reset");
            setNewEmail(data.email);
            setUserId(data.userId);
            toast.success("ยืนยันอีเมลใหม่สำเร็จ กรุณาตั้งรหัสผ่านใหม่");
          }
        } else {
          setVerificationStatus("error");

          if (data.alreadyVerified) {
            setErrorMessage(`อีเมล ${data.email || ""} ได้รับการยืนยันแล้ว`);
          } else if (data.expired) {
            setErrorMessage("โทเคนยืนยันหมดอายุแล้ว กรุณาขอโทเคนใหม่");
          } else {
            setErrorMessage(data.error || "เกิดข้อผิดพลาดในการยืนยันอีเมล");
          }
        }
      } catch (error) {
        console.error("Error verifying new email:", error);
        setVerificationStatus("error");
        setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    };

    verifyNewEmail();
  }, [token, email]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
        {/* Decorative elements - ซ่อนในมือถือ */}
        {!isMobile && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
          </>
        )}

        {/* Email verification icon - ซ่อนในมือถือ */}
        {!isMobile && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
            <svg
              width="200"
              height="200"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ยืนยันอีเมลใหม่
          </motion.h1>
          <motion.div
            className="w-24 h-1 bg-white mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <motion.p
            className="text-lg md:text-xl text-blue-100 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            ยืนยันอีเมลใหม่และตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
          </motion.p>
        </div>
      </div>

      {/* Verification Content */}
      <VerificationContent
        verificationStatus={verificationStatus}
        setVerificationStatus={setVerificationStatus}
        errorMessage={errorMessage}
        newEmail={newEmail}
        email={email}
        userId={userId}
        token={token}
        router={router}
      />

      <Footer />
    </main>
  );
}
