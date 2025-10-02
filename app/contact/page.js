"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Contact() {
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [charCount, setCharCount] = useState(0);
  const maxChars = 300;
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setCharCount(formData.message.length);
  }, [formData.message]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "message" && value.length > maxChars) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/contact/not-user-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("sent");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setCharCount(0);
      } else {
        setStatus("error");
        setError(result.message || "เกิดข้อผิดพลาดในการส่งข้อความ");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setStatus("error");
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
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

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1,
      },
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

          {/* Contact icon - ซ่อนในมือถือ */}
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
                  d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09494 3.90347 2.12781 3.62476 2.21643 3.36163C2.30506 3.09849 2.4475 2.85669 2.63476 2.65163C2.82202 2.44656 3.04986 2.28271 3.30385 2.17052C3.55783 2.05834 3.83256 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5864 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">ติดต่อเรา</h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              เรายินดีให้คำปรึกษาและช่วยเหลือสมาชิกทุกท่าน
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold text-gray-900 mb-12 text-center"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              ข้อมูลการติดต่อ
              <motion.div
                className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.h2>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Address */}
              <motion.div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">ที่อยู่</h3>
                <p className="text-gray-600 text-sm">
                  สภาอุตสาหกรรมแห่งประเทศไทย
                  <br />
                  ชั้น 8 อาคารปฏิบัติการเทคโนโลยีเชิงสร้างสรรค์
                  <br />
                  เลขที่ 2 ถนนนางลิ้นจี่ แขวงทุ่งมหาเมฆ
                  <br />
                  เขตสาทร กรุงเทพมหานคร 10120
                </p>
              </motion.div>

              {/* Phone */}
              <motion.div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">โทรศัพท์</h3>
                <p className="text-gray-600">
                  <a href="tel:1453,2" className="hover:text-blue-900 transition-colors">
                    1453 กด 2
                  </a>
                </p>
              </motion.div>

              {/* Email */}
              <motion.div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">อีเมล</h3>
                <p className="text-gray-600">
                  <a
                    href="mailto:member@fti.or.th"
                    className="hover:text-blue-900 transition-colors"
                  >
                    member@fti.or.th
                  </a>
                </p>
              </motion.div>

              {/* Operating Hours */}
              <motion.div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center"
                variants={fadeInUp}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">เวลาทำการ</h3>
                <p className="text-gray-600 text-sm">
                  วันจันทร์ - วันศุกร์: 08:30 - 17:30 น.
                  <br />
                  วันเสาร์ - วันอาทิตย์ และ
                  <br />
                  วันหยุดนักขัตฤกษ์: ปิดทำการ
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-8"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                แผนที่การเดินทาง
                <motion.div
                  className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                สภาอุตสาหกรรมแห่งประเทศไทย ตั้งอยู่ที่ เลขที่ 2 ถนนนางลิ้นจี่ แขวงทุ่งมหาเมฆ เขตสาทร
                กรุงเทพมหานคร 10120
              </p>
            </motion.div>

            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.0467637199!2d100.53745807592163!3d13.714983086679392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f30d9277c91%3A0xb0335c0a3e410767!2sThe%20Federation%20of%20Thai%20Industries!5e0!3m2!1sen!2sth!4v1708936207101!5m2!1sen!2sth"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="สภาอุตสาหกรรมแห่งประเทศไทย"
                className="w-full"
              ></iframe>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">การเดินทางโดยรถสาธารณะ</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-700 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                    <span>BTS สถานีช่องนนทรี ทางออก 1 เดินประมาณ 10 นาที</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-700 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                    <span>รถประจำทางสาย 77, 22, 62</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">สิ่งอำนวยความสะดวก</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-700 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>ที่จอดรถสำหรับผู้มาติดต่อ</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-700 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>ร้านอาหารและร้านกาแฟภายในอาคาร</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-700 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>Wi-Fi ฟรีสำหรับผู้มาติดต่อ</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div
                className="text-center mb-12"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ส่งข้อความถึงเรา
                  <motion.div
                    className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                    initial={{ width: 0 }}
                    animate={{ width: 64 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </h2>
                <p className="text-gray-600">
                  หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณากรอกแบบฟอร์มด้านล่าง
                </p>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={fadeInUp}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ-นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เรื่องที่ติดต่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      ข้อความ <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-sm ${charCount > maxChars * 0.9 ? "text-red-500" : "text-gray-500"}`}
                    >
                      {charCount}/{maxChars}
                    </span>
                  </div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    maxLength={maxChars}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  ></textarea>
                  <motion.div className="w-full h-1 bg-gray-200 mt-1 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${charCount > maxChars * 0.9 ? "bg-red-500" : "bg-blue-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(charCount / maxChars) * 100}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full px-8 py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? "กำลังส่ง..." : "ส่งข้อความ"}
                  </button>
                </motion.div>

                {status === "sent" && (
                  <motion.div
                    className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ส่งข้อความเรียบร้อยแล้ว ขอบคุณที่ติดต่อเรา
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error || "เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง"}
                  </motion.div>
                )}
              </motion.form>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
