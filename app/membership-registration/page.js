"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MembershipRegistration() {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const membershipTypes = [
    {
      id: "ic",
      title: "Individual Membership",
      subtitle: "สมาชิกบุคคลธรรมดา",
      description: "สำหรับบุคคลธรรมดาที่ต้องการเข้าร่วมเป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย",
      features: [
        "เข้าร่วมกิจกรรมของสภา",
        "รับข้อมูลข่าวสารอุตสาหกรรม",
        "สิทธิประโยชน์สำหรับสมาชิก",
        "เครือข่ายผู้ประกอบการ",
      ],
      color: "blue",
    },
    {
      id: "oc",
      title: "Organization Membership",
      subtitle: "สมาชิกนิติบุคคล",
      description: "สำหรับบริษัท ห้างหุ้นส่วน หรือนิติบุคคลอื่นๆ",
      features: [
        "สิทธิประโยชน์สำหรับองค์กร",
        "รับเอกสารรับรองสมาชิก",
        "เข้าร่วมการประชุมสมาชิก",
        "บริการด้านกฎหมายและภาษี",
      ],
      color: "green",
    },
    {
      id: "am",
      title: "Associate Member",
      subtitle: "สมาชิกสมทบ",
      description: "สำหรับผู้ที่สนใจเข้าร่วมเป็นสมาชิกสมทบ",
      features: [
        "เข้าร่วมกิจกรรมบางประเภท",
        "รับข้อมูลข่าวสาร",
        "สิทธิประโยชน์เบื้องต้น",
        "เครือข่ายเชื่อมต่อ",
      ],
      color: "purple",
    },
    {
      id: "ac",
      title: "Associate Chapter",
      subtitle: "สมาชิกสมทบสาขา",
      description: "สำหรับหน่วยงานหรือองค์กรที่ต้องการเข้าร่วมเป็นสมาชิกสมทบสาขา",
      features: [
        "เข้าร่วมกิจกรรมระดับสาขา",
        "รับการสนับสนุนจากสภา",
        "เครือข่ายในพื้นที่",
        "บริการด้านการปรึกษา",
      ],
      color: "orange",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-600",
        hover: "hover:bg-blue-700",
        text: "text-blue-600",
        border: "border-blue-200",
        light: "bg-blue-50",
      },
      green: {
        bg: "bg-green-600",
        hover: "hover:bg-green-700",
        text: "text-green-600",
        border: "border-green-200",
        light: "bg-green-50",
      },
      purple: {
        bg: "bg-purple-600",
        hover: "hover:bg-purple-700",
        text: "text-purple-600",
        border: "border-purple-200",
        light: "bg-purple-50",
      },
      orange: {
        bg: "bg-orange-600",
        hover: "hover:bg-orange-700",
        text: "text-orange-600",
        border: "border-orange-200",
        light: "bg-orange-50",
      },
    };
    return colors[color];
  };

  const handleMembershipSelect = (type) => {
    router.push(`/membership?type=${type}`);
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
              สมัครสมาชิก
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
              เลือกประเภทสมาชิกที่เหมาะสมกับคุณ
              <br />
              และเข้าร่วมเป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย
            </motion.p>
          </div>
        </motion.div>

        {/* Membership Types */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {membershipTypes.map((type, index) => {
                const colors = getColorClasses(type.color);
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                  >
                    <div className={`h-2 ${colors.bg}`}></div>
                    <div className="p-8">
                      <div className="text-center mb-6">
                        <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>{type.title}</h3>
                        <p className="text-lg text-gray-600 font-medium">{type.subtitle}</p>
                      </div>

                      <p className="text-gray-700 mb-6 text-center">{type.description}</p>

                      <ul className="space-y-3 mb-8">
                        {type.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <svg
                              className={`w-5 h-5 ${colors.text} mr-3 mt-0.5 flex-shrink-0`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleMembershipSelect(type.id)}
                        className={`w-full py-3 px-6 ${colors.bg} ${colors.hover} text-white font-medium rounded-lg transition-colors duration-200`}
                      >
                        เลือกประเภทนี้
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-12"
            >
              <p className="text-gray-600 mb-4">มีข้อสงสัยเกี่ยวกับการสมัครสมาชิก?</p>
              <Link
                href="/contact"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                ติดต่อเรา
              </Link>
            </motion.div>
          </div>
        </section>
      </motion.main>
      <Footer />
    </>
  );
}
