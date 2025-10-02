"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import RequestOTP from "./components/RequestOTP";
import VerifyOTP from "./components/VerifyOTP";
import ConfirmNewEmail from "./components/ConfirmNewEmail";
import SuccessMessage from "./components/SuccessMessage";

export default function ChangeEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (!user) {
      router.push("/login");
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
          </div>
        </div>
      </div>
    );
  }

  const goToNextStep = (data) => {
    if (data && data.token) {
      setToken(data.token);
    }
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RequestOTP userEmail={user.email} onSuccess={goToNextStep} />;
      case 2:
        return <VerifyOTP userId={user.id} onSuccess={goToNextStep} onBack={goToPreviousStep} />;
      case 3:
        return (
          <ConfirmNewEmail
            userId={user.id}
            token={token}
            onSuccess={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 4:
        return (
          <VerifyOTP
            userId={user.id}
            onSuccess={goToNextStep}
            onBack={goToPreviousStep}
            title="ขั้นตอนที่ 4: ยืนยัน OTP ที่ส่งไปยังอีเมลใหม่"
            description="กรุณาตรวจสอบอีเมลใหม่ของท่านและกรอกรหัส OTP ที่ได้รับ"
            isNewEmail={true}
          />
        );
      case 5:
        return <SuccessMessage />;
      default:
        return <RequestOTP userEmail={user.email} onSuccess={goToNextStep} />;
    }
  };

  // Simple animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section - ใช้แบบเดียวกับหน้าอื่น */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* ลด decorative elements ในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}

          {/* Email icon - ซ่อนในมือถือ */}
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
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6L12 13L2 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">แจ้งเปลี่ยนอีเมล</h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              เปลี่ยนอีเมลสำหรับการเข้าสู่ระบบและรับการแจ้งเตือน
            </p>
          </div>
        </div>

        <div className="py-12">
          <Toaster position="top-right" />
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 px-6 py-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white text-center">
                    แจ้งเปลี่ยนอีเมล
                    <motion.div
                      className="w-16 h-1 bg-white mx-auto mt-3"
                      initial={{ width: 0 }}
                      animate={{ width: 64 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    />
                  </h2>
                </div>

                {/* คำอธิบายวิธีใช้งาน */}
                <div className="bg-blue-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">วิธีการเปลี่ยนอีเมล</h3>
                  <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                    <li>ขอรหัส OTP ที่จะส่งไปยังอีเมลปัจจุบันของท่าน</li>
                    <li>กรอกรหัส OTP ที่ได้รับทางอีเมลเพื่อยืนยันตัวตน</li>
                    <li>กรอกอีเมลใหม่ที่ท่านต้องการใช้งาน</li>
                    <li>กรอกรหัส OTP ที่ส่งไปยังอีเมลใหม่ของท่าน</li>
                    <li>เสร็จสิ้นการเปลี่ยนอีเมล</li>
                  </ol>
                  <p className="text-xs text-red-600 mt-2">
                    หมายเหตุ: หลังจากเปลี่ยนอีเมลสำเร็จ ท่านจะต้องรอ 7
                    วันก่อนที่จะสามารถเปลี่ยนอีเมลได้อีกครั้ง
                  </p>
                </div>

                {/* Progress Steps - ปรับให้ responsive */}
                <div className="p-4 md:p-6 border-b">
                  {/* Desktop Progress */}
                  {!isMobile && (
                    <>
                      <div className="mb-2">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                          >
                            1
                          </div>
                          <div
                            className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
                          ></div>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                          >
                            2
                          </div>
                          <div
                            className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"}`}
                          ></div>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                          >
                            3
                          </div>
                          <div
                            className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? "bg-blue-600" : "bg-gray-200"}`}
                          ></div>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                          >
                            4
                          </div>
                          <div
                            className={`flex-1 h-1 mx-2 ${currentStep >= 5 ? "bg-blue-600" : "bg-gray-200"}`}
                          ></div>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 5 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
                          >
                            5
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 px-1 mb-6">
                        <div className="text-center" style={{ marginLeft: "-12px", width: "60px" }}>
                          ขอรหัส OTP
                        </div>
                        <div className="text-center" style={{ width: "60px" }}>
                          ยืนยัน OTP
                        </div>
                        <div className="text-center" style={{ width: "70px" }}>
                          กรอกอีเมลใหม่
                        </div>
                        <div className="text-center" style={{ width: "70px" }}>
                          ยืนยัน OTP อีเมลใหม่
                        </div>
                        <div
                          className="text-center"
                          style={{ marginRight: "-12px", width: "60px" }}
                        >
                          เสร็จสิ้น
                        </div>
                      </div>
                    </>
                  )}

                  {/* Mobile Progress - แสดงเฉพาะขั้นตอนปัจจุบัน */}
                  {isMobile && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600 mb-2">
                        ขั้นตอนที่ {currentStep} จาก 5
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(currentStep / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {currentStep === 1 && "ขอรหัส OTP"}
                        {currentStep === 2 && "ยืนยัน OTP"}
                        {currentStep === 3 && "กรอกอีเมลใหม่"}
                        {currentStep === 4 && "ยืนยัน OTP อีเมลใหม่"}
                        {currentStep === 5 && "เสร็จสิ้น"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
