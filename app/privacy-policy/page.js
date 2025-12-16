"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section - ใช้แบบเดียวกับหน้าอื่น */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* ลด decorative elements ในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}

          {/* Shield icon - ซ่อนในมือถือ */}
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
                  d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              นโยบายความเป็นส่วนตัว
            </h1>
            <motion.div
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              ข้อมูลเกี่ยวกับนโยบายความเป็นส่วนตัวของสภาอุตสาหกรรมแห่งประเทศไทย
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto relative overflow-hidden"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            {/* ลด decorative elements ในมือถือ */}
            {!isMobile && (
              <>
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-50 rounded-full -ml-20 -mb-20"></div>
              </>
            )}

            <div className="relative z-10">
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                นโยบายความเป็นส่วนตัว
                <motion.div
                  className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </motion.h2>

              <div className="space-y-6 text-gray-600 leading-relaxed">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-medium text-blue-800">
                    สภาอุตสาหกรรมแห่งประเทศไทย (&quot;สภาอุตสาหกรรมฯ&quot;)
                    ให้ความสำคัญกับความเป็นส่วนตัวของข้อมูลส่วนบุคคลของท่าน
                    และมุ่งมั่นที่จะคุ้มครองข้อมูลส่วนบุคคลของท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                    พ.ศ. 2562
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                    1. ข้อมูลที่เราเก็บรวบรวม
                  </h3>
                  <p className="mb-4">
                    เราอาจเก็บรวบรวมข้อมูลส่วนบุคคลของท่านจากการที่ท่านลงทะเบียนเป็นสมาชิก
                    การใช้บริการ การติดต่อสอบถาม หรือการเข้าร่วมกิจกรรมต่างๆ ของสภาอุตสาหกรรมฯ
                    ซึ่งข้อมูลส่วนบุคคลที่เราเก็บรวบรวมอาจรวมถึง:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>ข้อมูลส่วนตัว เช่น ชื่อ-นามสกุล ที่อยู่ อีเมล หมายเลขโทรศัพท์</li>
                    <li>ข้อมูลบริษัท เช่น ชื่อบริษัท ตำแหน่ง ประเภทธุรกิจ</li>
                    <li>ข้อมูลการเงิน เช่น ข้อมูลการชำระค่าสมาชิก</li>
                    <li>ข้อมูลการใช้งานเว็บไซต์ เช่น IP Address, Cookies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                    2. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล
                  </h3>
                  <p className="mb-4">
                    เราเก็บรวบรวมข้อมูลส่วนบุคคลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>เพื่อการบริหารจัดการสมาชิกและการให้บริการต่างๆ</li>
                    <li>เพื่อการติดต่อสื่อสารและประชาสัมพันธ์กิจกรรมต่างๆ</li>
                    <li>เพื่อการวิเคราะห์และพัฒนาบริการให้ตรงกับความต้องการของสมาชิก</li>
                    <li>เพื่อการปฏิบัติตามกฎหมายและระเบียบที่เกี่ยวข้อง</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                    3. การเปิดเผยข้อมูล
                  </h3>
                  <p className="mb-4">
                    เราอาจเปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลหรือหน่วยงานดังต่อไปนี้:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>หน่วยงานภายในของสภาอุตสาหกรรมฯ ที่เกี่ยวข้องกับการให้บริการแก่ท่าน</li>
                    <li>
                      ผู้ให้บริการภายนอกที่เราใช้ในการดำเนินงาน เช่น
                      ผู้ให้บริการด้านเทคโนโลยีสารสนเทศ
                    </li>
                    <li>หน่วยงานรัฐหรือหน่วยงานกำกับดูแลตามที่กฎหมายกำหนด</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                    4. การรักษาความปลอดภัยของข้อมูล
                  </h3>
                  <p className="mb-4">
                    เราได้นำมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของท่าน
                    ซึ่งรวมถึง:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>การเข้ารหัสข้อมูลในการส่งผ่านและการจัดเก็บ</li>
                    <li>การควบคุมการเข้าถึงข้อมูลโดยบุคลากรที่ได้รับอนุญาตเท่านั้น</li>
                    <li>การติดตั้งและอัปเดตระบบความปลอดภัยอย่างสม่ำเสมอ</li>
                    <li>การฝึกอบรมบุคลากรเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคล</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                    5. สิทธิของเจ้าของข้อมูล
                  </h3>
                  <p className="mb-4">
                    ท่านมีสิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่านตามที่กำหนดไว้ในพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                    พ.ศ. 2562 ซึ่งรวมถึง:
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="list-disc pl-6 space-y-2 text-green-800">
                      <li>สิทธิในการเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคล</li>
                      <li>สิทธิในการแก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง</li>
                      <li>สิทธิในการลบหรือทำลายข้อมูลส่วนบุคคล</li>
                      <li>สิทธิในการระงับการใช้ข้อมูลส่วนบุคคล</li>
                      <li>สิทธิในการคัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล</li>
                      <li>สิทธิในการพกพาข้อมูลส่วนบุคคล</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                    6. การใช้คุกกี้ (Cookies)
                  </h3>
                  <p className="mb-4">
                    เว็บไซต์ของเราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานของท่าน ซึ่งรวมถึง:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>คุกกี้ที่จำเป็นสำหรับการทำงานของเว็บไซต์</li>
                    <li>คุกกี้สำหรับการวิเคราะห์การใช้งาน</li>
                    <li>คุกกี้สำหรับการปรับแต่งเนื้อหาตามความต้องการ</li>
                  </ul>
                  <p className="mt-2 text-sm text-gray-500">
                    ท่านสามารถปรับการตั้งค่าเบราว์เซอร์เพื่อปฏิเสธการใช้คุกกี้ได้
                    แต่อาจส่งผลให้บางฟังก์ชันของเว็บไซต์ทำงานไม่ปกติ
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">7. การติดต่อ</h3>
                  <p className="mb-4">
                    หากท่านมีข้อสงสัยหรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่าน
                    สามารถติดต่อเราได้ที่:
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">
                      <strong>เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</strong>
                      <br />
                      สภาอุตสาหกรรมแห่งประเทศไทย
                      <br />
                      เลขที่ 1126/1 อาคารพญาไทพลาซ่า ชั้น 9 ถนนพญาไท แขวงถนนพญาไท เขตราชเทวี
                      กรุงเทพฯ 10400
                      <br />
                      โทรศัพท์: 0-2345-1000
                      <br />
                      อีเมล: dpo@fti.or.th
                      <br />
                      อีเมลทั่วไป: info@fti.or.th
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500">
                    วันที่มีผลบังคับใช้: 1 มกราคม 2567
                    <br />
                    อัปเดตล่าสุด: 1 มกราคม 2567
                    <br />
                    นโยบายนี้อาจมีการปรับปรุงเป็นครั้งคราว โปรดตรวจสอบอัปเดตล่าสุด
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/terms-of-service"
                      className="text-blue-600 hover:text-blue-700 font-medium mr-6"
                    >
                      ข้อกำหนดและเงื่อนไขการใช้บริการ
                    </Link>
                    <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                      ติดต่อเรา
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
