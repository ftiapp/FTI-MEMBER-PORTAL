"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MemberConfirmation() {
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    membershipNumber: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    confirmType: "existing"
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ส่งข้อมูลไปตรวจสอบกับ API
      const response = await fetch('/api/member/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('ยืนยันตัวตนสำเร็จ! กำลังนำทางไปยังหน้าสมาชิก...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        toast.error(result.message || 'ไม่สามารถยืนยันตัวตนได้ กรุณาตรวจสอบข้อมูลอีกครั้ง');
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
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
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <motion.h1
              className="text-3xl md:text-5xl font-bold mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              ยืนยันสมาชิกเดิม
            </motion.h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <motion.p
              className="text-lg md:text-xl text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              ยืนยันตัวตนสมาชิกเดิมเพื่อเข้าใช้งานระบบ
              <br />
              กรุณากรอกข้อมูลให้ครบถ้วนเพื่อยืนยันสถานะสมาชิก
            </motion.p>
          </div>
        </motion.div>

        {/* Confirmation Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Membership Number */}
                  <div>
                    <label htmlFor="membershipNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      เลขที่สมาชิก <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="membershipNumber"
                      name="membershipNumber"
                      value={formData.membershipNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="กรอกเลขที่สมาชิกของคุณ"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0xxxxxxxxx"
                    />
                  </div>

                  {/* Company Name (Optional) */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อบริษัท/หน่วยงาน (สำหรับสมาชิกนิติบุคคล)
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ชื่อบริษัท จำกัด"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          กำลังยืนยัน...
                        </span>
                      ) : (
                        'ยืนยันตัวตน'
                      )}
                    </button>
                  </div>
                </form>

                {/* Help Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      มีปัญหาในการยืนยันตัวตนหรือไม่?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        ติดต่อเรา
                      </Link>
                      <Link
                        href="/membership-registration"
                        className="inline-flex items-center justify-center text-green-600 hover:text-green-700 font-medium"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        สมัครสมาชิกใหม่
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">คำแนะนำ:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• กรอกเลขที่สมาชิกที่ได้รับจากเอกสารรับรองสมาชิก</li>
                    <li>• ใช้อีเมลที่ลงทะเบียนไว้กับสภาฯ</li>
                    <li>• หากไม่สามารถยืนยันได้ กรุณาติดต่อเจ้าหน้าที่</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </motion.main>
      <Footer />
    </>
  );
}
