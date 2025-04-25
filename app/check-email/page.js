'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function CheckEmail() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5, 
        when: "beforeChildren", 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
    tap: { scale: 0.95 }
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    // นับถอยหลัง 20 วินาที
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // เมื่อนับถอยหลังเสร็จ ให้นำผู้ใช้ไปยังหน้า login
          // ใช้ setTimeout เพื่อหลีกเลี่ยงการเรียกใช้ router.push() ในระหว่างการเรนเดอร์
          setTimeout(() => {
            router.push('/login');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // ล้าง timer เมื่อ component unmount
    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <motion.section 
        className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-custom">
          <div className="py-16 text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              ยืนยันอีเมลของท่าน
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-blue-100"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              กรุณาตรวจสอบอีเมลของท่านเพื่อยืนยันการสมัครสมาชิก
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Email Verification Instructions */}
      <motion.section 
        className="py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div 
                className="flex justify-center mb-6"
                variants={itemVariants}
              >
                <motion.div 
                  className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20, 
                    delay: 0.3 
                  }}
                >
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-blue-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </motion.svg>
                </motion.div>
              </motion.div>
              
              <motion.h2 
                className="text-2xl font-bold text-gray-800 mb-4"
                variants={itemVariants}
              >
                กรุณาตรวจสอบอีเมลของท่าน
              </motion.h2>
              
              {email && (
                <motion.p 
                  className="text-lg text-blue-600 font-medium mb-4"
                  variants={itemVariants}
                >
                  {email}
                </motion.p>
              )}
              
              <motion.div 
                className="bg-blue-50 p-4 rounded-lg mb-6"
                variants={itemVariants}
              >
                <motion.p 
                  className="text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  เราได้ส่งอีเมลยืนยันไปยังอีเมลของท่าน กรุณาตรวจสอบและคลิกที่ลิงก์ในอีเมลเพื่อยืนยันการสมัครสมาชิก
                </motion.p>
                <motion.p 
                  className="text-gray-700 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  หากไม่พบอีเมลในกล่องจดหมาย กรุณาตรวจสอบในโฟลเดอร์ Junk Mail หรือ Spam
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="text-gray-600 mb-6"
                variants={itemVariants}
              >
                <p>กำลังนำท่านไปยังหน้าเข้าสู่ระบบใน <motion.span 
                  className="font-bold text-blue-600"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                >{countdown}</motion.span> วินาที</p>
              </motion.div>
              
              <motion.div 
                className="flex justify-center space-x-4"
                variants={itemVariants}
              >
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors">
                    ไปที่หน้าเข้าสู่ระบบ
                  </Link>
                </motion.div>
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link href="/" className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg px-5 py-2.5 transition-colors">
                    กลับหน้าหลัก
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </main>
  );
}
