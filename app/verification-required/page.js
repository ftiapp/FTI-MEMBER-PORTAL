"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function VerificationRequired() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("idle"); // 'idle', 'success', 'error'
  const [message, setMessage] = useState("");

  const handleResendVerification = async () => {
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setStatus("success");
      setMessage("ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ");
    } catch (error) {
      console.error("Resend verification error:", error);
      setStatus("error");
      setMessage("เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.03, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.97 },
    disabled: { opacity: 0.5 },
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-custom">
          <div className="py-16 text-center">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              ยืนยันอีเมลของคุณ
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              กรุณายืนยันอีเมลของคุณเพื่อเข้าใช้งานระบบ
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Verification Required Section */}
      <section className="py-12">
        <div className="container-custom">
          <motion.div
            className="max-w-xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg p-8"
              variants={itemVariants}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="text-center mb-6" variants={itemVariants}>
                <motion.div
                  className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.3,
                    duration: 0.5,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
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
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold text-gray-800 mb-2"
                  variants={itemVariants}
                >
                  กรุณายืนยันอีเมลของคุณ
                </motion.h2>
                <motion.p className="text-gray-600" variants={itemVariants}>
                  เราได้ส่งอีเมลยืนยันไปยังอีเมลของคุณแล้ว
                  กรุณาตรวจสอบกล่องจดหมายของคุณและคลิกที่ลิงก์ยืนยันเพื่อเปิดใช้งานบัญชีของคุณ
                </motion.p>
              </motion.div>

              {status === "success" && (
                <motion.div
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <motion.svg
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 15, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">{message}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <motion.svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 15, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">{message}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div className="space-y-6" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <motion.p className="text-gray-600 mb-4" variants={itemVariants}>
                    หากคุณไม่ได้รับอีเมลยืนยัน หรืออีเมลยืนยันหมดอายุ
                    คุณสามารถขอรับอีเมลยืนยันใหม่ได้
                  </motion.p>

                  <motion.div className="mb-4" variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      อีเมลของคุณ
                    </label>
                    <motion.input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                      disabled={isSubmitting}
                      required
                      initial={{ borderColor: "rgb(209, 213, 219)" }}
                      whileFocus={{
                        borderColor: "rgb(59, 130, 246)",
                        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
                      }}
                    />
                  </motion.div>

                  <motion.button
                    onClick={handleResendVerification}
                    disabled={isSubmitting || !email}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover={!isSubmitting && email ? "hover" : "disabled"}
                    whileTap={!isSubmitting && email ? "tap" : "disabled"}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          initial={{ rotateZ: 0 }}
                          animate={{ rotateZ: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
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
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </motion.svg>
                        กำลังส่งอีเมล...
                      </>
                    ) : (
                      "ส่งอีเมลยืนยันใหม่"
                    )}
                  </motion.button>
                </motion.div>

                <motion.div
                  className="border-t border-gray-200 pt-6 text-center"
                  variants={itemVariants}
                >
                  <motion.p className="text-gray-600" variants={fadeInVariants}>
                    กลับไปที่{" "}
                    <motion.span whileHover={{ color: "#1e40af" }} transition={{ duration: 0.2 }}>
                      <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                        หน้าเข้าสู่ระบบ
                      </Link>
                    </motion.span>
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
