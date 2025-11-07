"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Image from "next/image";
import YouTubeAutoplay from "./components/YouTubeAutoplay";

export default function Home() {
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

  // Simple animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <>
      <Navbar />
      <motion.main className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <motion.div
          className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}

          {/* Home/Building icon - ซ่อนในมือถือ */}
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
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22V12H15V22"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* Background pattern */}
          <div className="absolute inset-0 bg-blue-800 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <motion.h1
              className="text-3xl md:text-5xl font-bold mb-4 text-center"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              สภาอุตสาหกรรมแห่งประเทศไทย
            </motion.h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <motion.p
              className="text-lg md:text-xl text-center max-w-3xl mx-auto"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              เป็นแกนกลางเสริมสร้างความเข้มแข็งและผลิตภาพอุตสาหกรรมไทย
              <br />
              ให้สามารถแข่งขันได้ในระดับสากล
            </motion.p>

          </div>
        </motion.div>

        {/* Video Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                วิธีการสมัครใช้งาน
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                วิดีโอแนะนำวิธีการสมัครสมาชิกและยืนยันสมาชิกเดิม
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <YouTubeAutoplay 
                videoId="oynt-orKzyE" 
                title="วิธีการสมัครใช้งาน สภาอุตสาหกรรมแห่งประเทศไทย"
              />
            </motion.div>
          </div>
        </section>

        {/* White section under hero with centered image */}
        <section className="bg-white">
          <div className="container mx-auto px-4 py-10 flex justify-center">
            <Image
              src="/FTI%20PIC.png"
              alt="สภาอุตสาหกรรมแห่งประเทศไทย - เป็นแกนกลางเสริมสร้างความเข้มแข็งและผลิตภาพอุตสาหกรรมไทย ให้สามารถแข่งขันได้ในระดับสากล"
              width={1000}
              height={563}
              priority
              className="w-full max-w-4xl h-auto rounded-xl shadow-xl"
            />
          </div>
        </section>
      </motion.main>
      <Footer />
    </>
  );
}
