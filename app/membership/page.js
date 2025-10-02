"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Membership() {
  const [isMobile, setIsMobile] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDocumentTab, setActiveDocumentTab] = useState("ordinary");
  const [memberCount, setMemberCount] = useState(0);
  const itemsPerPage = 5;
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Animated counter for member count
  useEffect(() => {
    const target = 16000;
    const duration = 1500;
    const start = performance.now();
    let rafId;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setMemberCount(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const membershipTypes = [
    {
      id: "oc",
      name: "สามัญ-โรงงาน",
      description: "สน (OC)",
      annual_fee: 1000,
      feeText: "1,000–100,000 บาท/ปี (คำนวณตามรายได้)",
      features: [
        "สิทธิในการเข้าร่วมประชุมใหญ่",
        "สิทธิในการออกเสียงเลือกตั้ง",
        "รับข้อมูลข่าวสารจากภาคอุตสาหกรรม",
      ],
      highlight: true,
      path: "/membership/oc",
    },
    {
      id: "am",
      name: "สมาชิกสามัญ-สมาคมการค้า",
      description: "สส (AM)",
      annual_fee: 10000,
      feeText: "10,000–100,000 บาท/ปี (คำนวณตามจำนวนสมาชิก)",
      features: [
        "สิทธิในการเข้าร่วมประชุมใหญ่",
        "รับข้อมูลข่าวสารจากภาคอุตสาหกรรม",
        "เครือข่ายธุรกิจอุตสาหกรรม",
      ],
      highlight: false,
      path: "/membership/am",
    },
    {
      id: "ac",
      name: "สมทบ-นิติบุคคล",
      description: "ทน (AC)",
      annual_fee: 2400,
      feeText: "2,400 บาท/ปี",
      features: [
        "เข้าร่วมกิจกรรมของสภาอุตสาหกรรม",
        "รับข้อมูลข่าวสารจากภาคอุตสาหกรรม",
        "เครือข่ายธุรกิจอุตสาหกรรม",
      ],
      highlight: true,
      path: "/membership/ac",
    },
    {
      id: "ic",
      name: "สมทบ-บุคคลธรรมดา",
      description: "ทบ (IC)",
      annual_fee: 600,
      feeText: "600 บาท/ปี",
      features: [
        "เข้าร่วมกิจกรรมของสภาอุตสาหกรรม",
        "รับข้อมูลข่าวสารจากภาคอุตสาหกรรม",
        "เครือข่ายธุรกิจอุตสาหกรรม",
      ],
      highlight: false,
      path: "/membership/ic",
    },
  ];

  const benefits = [
    {
      id: 1,
      title:
        "สิทธิในการลงคะแนนเลือกตั้งกรรมการ ส.อ.ท. และกรรมการสภาอุตสาหกรรมจังหวัด (ตามวาระที่มีการเลือกตั้ง)",
      ordinary: true,
      associate: false,
      supporting: false,
    },
    {
      id: 2,
      title: "ส่วนลดเงินคืน 30 % เพื่อนำมาใช้จ่ายในการเข้าร่วมกิจกรรม/บริการของ ส.อ.ท.",
      ordinary: true,
      associate: false,
      supporting: false,
    },
    {
      id: 3,
      title:
        "บัตร FTI e-Member Card (บัตรสมาชิกส่วนบุคคลเพื่อรับสิทธิส่วนลดร้านอาหาร ที่พัก ตั๋วเครื่องบินและผลิตภัณฑ์ / บริการจากสมาชิกสู่สมาชิก)",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 4,
      title: "ส่วนลดในการขอรับการรับรองสินค้าผลิตในประเทศไทย Made in Thailand (MiT)",
      ordinary: true,
      associate: false,
      supporting: false,
    },
    {
      id: 5,
      title:
        "สิทธิในการสมัครบัตรเดินทางสำหรับนักธุรกิจ APEC Card (เดินทางเข้าเมืองใน 19 เขตเศรษฐกิจ โดยไม่ต้องขอ VISA ทุกครั้ง ก่อนการเดินทาง และช่องทางพิเศษ Fast Track Lane)",
      ordinary: true,
      associate: true,
      supporting: false,
    },
    {
      id: 6,
      title: "บริการออกใบรับรองแหล่งกำเนิดสินค้าด้วยระบบออนไลน์ (e-C/O)",
      ordinary: true,
      associate: true,
      supporting: false,
    },
    {
      id: 7,
      title: "หนังสือรับรองการจำหน่าย (Certificate of Free Sale)",
      ordinary: true,
      associate: true,
      supporting: false,
    },
    {
      id: 8,
      title: "สิทธิในการเข้าร่วมโครงการ SMEs Pro-Active (สนับสนุนค่าใช้จ่ายในการออกบูธต่างประเทศ)",
      ordinary: true,
      associate: true,
      supporting: false,
    },
    {
      id: 9,
      title: "สิทธิในการขยายช่องทางตลาดการค้าออนไลน์ (B2B, E-Commerce) บน FTIebusiness.com",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 10,
      title: "บริการให้คำปรึกษาด้านการประยุกต์ใช้งานระบบบาร์โค้ดมาตรฐานสากล (GS1)",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 11,
      title:
        "FTI News รับข้อมูลข่าวสารด้านนโยบายภาครัฐ เศรษฐกิจ และกฎหมายเกี่ยวกับภาคอุตสาหกรรมประเทศไทยและการค้าระหว่างประเทศ",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 12,
      title:
        "สิทธิในการสร้างเครือข่ายธุรกิจและรับคำปรึกษาด้านการค้าการลงทุนผ่านสภาธุรกิจ ภายใต้การกำกับดูแลของ ส.อ.ท.",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 13,
      title:
        "สิทธิในการขายสินค้า ขยายโอกาสทางธุรกิจ ไปกับ Provincial E-Catalog (สงวนสิทธิ์เฉพาะสมาชิกจังหวัดเท่านั้น)",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 14,
      title:
        "สิทธิในการสมัครบัตรเครดิต ICBC-FTI Union Pay เพื่ออำนวยความสะดวกในการทำธุรกิจที่ประเทศจีน (และรับสิทธิประโยชน์ภายในบัตรเพิ่มเติม)",
      ordinary: true,
      associate: true,
      supporting: false,
    },
    {
      id: 15,
      title: "บริการออกหนังสือรับรองฐานะการเงินเพื่อขอรับสิทธิประโยชน์ทางด้านภาษี",
      ordinary: true,
      associate: true,
      supporting: false,
    },
    {
      id: 16,
      title: "สิทธิในการใช้บริการสินเชื่อ / ดอกเบี้ยอัตราพิเศษจากสถาบันการเงินพันธมิตร",
      ordinary: true,
      associate: true,
      supporting: false,
    },
    {
      id: 17,
      title: "บริการคลินิกให้คำปรึกษาทางด้านการเงิน",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 18,
      title:
        "รับส่วนลด 5-20 % ในการเข้าร่วมกิจกรรมอบรม สัมมนา หลักสูตร และศึกษาดูงานต่าง ๆ เช่น หลักสูตร Young FTI (เฉพาะสมาชิกประเภท สน), หลักสูตร BRAIN, หลักสูตรสำหรับนักบัญชี (เก็บชั่วโมงอบรมได้), หลักสูตรพลังงานเพื่อผู้บริหาร (EEP), หลักสูตร eDIT (พัฒนาโรงงานสู่ Smart Factory 4.0), หลักสูตรผู้จัดการโรงงาน, Incubation Program, Acceleration Program, การประเมินคาร์บอนฟุตพริ้นท์, หลักสูตร e-Learning (ฟรี), สิทธิได้รับ Priority การคัดเลือกเข้าร่วมหลักสูตร KFTI และ FTI Go Global และอื่น ๆ อีกมากมาย",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 19,
      title: "บริการ Innovation Matching Center เพื่อเชื่อมโยงระหว่างนักวิจัย, ผลงานวิจัย",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 20,
      title: "สิทธิเข้าโครงการรับเงินสนับสนุนกองทุนนวัตกรรมเพื่ออุตสาหกรรม (Innovation ONE)",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 21,
      title: "สิทธิเข้าร่วมโครงการ StartUp X Tycoon ต่อยอดธุรกิจจาก CEO ที่เข้าร่วมหลักสูตร BRAIN",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 22,
      title:
        "สิทธิในการเข้าร่วมโครงการตรวจสุขภาพพนักงานประจำปีกับ ส.อ.ท. (ประหยัดกว่าและสะดวกรวดเร็วกว่า)",
      ordinary: true,
      associate: false,
      supporting: false,
    },
    {
      id: 23,
      title: "สิทธิในการเสนอข้อร้องเรียน ปัญหาอุปสรรคจากการประกอบอุตสาหกรรม",
      ordinary: true,
      associate: false,
      supporting: false,
    },
    {
      id: 24,
      title: "บริการคลินิกให้คำปรึกษาด้านแรงงาน",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 25,
      title:
        "สิทธิในการเข้าร่วมโครงการมาตรฐาน ECO Factory (โรงงานอุตสาหกรรมเชิงนิเวศ) ซึ่งเทียบเท่าอุตสาหกรรมสีเขียวระดับที่ 4 (GI4)",
      ordinary: true,
      associate: false,
      supporting: false,
    },
    {
      id: 26,
      title: "บริการเตรียมความพร้อมขอการรับรองมาตรฐานอุตสาหกรรมไม้",
      ordinary: true,
      associate: false,
      supporting: false,
    },
    {
      id: 27,
      title:
        "บริการเทียบเคียงมาตรฐานสากล พร้อมการใช้โลโก้ PEFC บนผลิตภัณฑ์ที่ได้รับรองมาตรฐาน มตช.14061, มอก.2861",
      ordinary: true,
      associate: false,
      supporting: false,
    },
    {
      id: 28,
      title: "สิทธิในการขึ้นทำเนียบ ESCO สำหรับบริษัทจัดการพลังงาน",
      ordinary: true,
      associate: true,
      supporting: false,
    },
    {
      id: 29,
      title: "บริการคลินิกให้คำปรึกษาทางด้านสิ่งแวดล้อม พลังงาน และการจัดการบรรจุภัณฑ์",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 30,
      title: "รับวารสาร Energy Focus รูปแบบ Electronic File ทางอีเมลทุก ๆ 3 เดือน",
      ordinary: true,
      associate: true,
      supporting: true,
    },
    {
      id: 31,
      title:
        "สิทธิส่วนลดค่าบริการที่ปรึกษาการประเมินคาร์บอนฟุตพริ้นท์ของผลิตภัณฑ์ (CFP) และคาร์บอนฟุตพริ้นท์ขององค์กร (CFO)",
      ordinary: true,
      associate: true,
      supporting: true,
    },
  ];

  const documentRequirements = {
    ordinary: {
      title: "สมาชิกสามัญ - โรงงาน (สน)",
      description:
        "เป็นนิติบุคคลที่ตั้งขึ้นตามกฎหมายไทย และประกอบอุตสาหกรรมจากการผลิต แบ่งออกเป็น 2 ประเภท ดังนี้",
      categories: [
        {
          title: "ประเภทที่ 1",
          subtitle: "มีเครื่องจักร มากกว่า 50 แรงม้า",
          requirements: [
            "มีใบอนุญาตประกอบกิจการโรงงาน (รง.4) / ใบอนุญาตให้ใช้ที่ดินและประกอบกิจการในนิคมอุตสาหกรรม (กนอ.)",
          ],
        },
        {
          title: "ประเภทที่ 2",
          subtitle: "ไม่มีเครื่องจักร/ มีเครื่องจักร ต่ำกว่า 50 แรงม้า",
          requirements: [
            "ไม่มีใบอนุญาตพิจารณาจากรหัส (TSIC Code) ที่จดทะเบียนกับกรมพัฒนาธุรกิจการค้ากระทรวงพาณิชย์ ซึ่งแสดงถึงความเกี่ยวข้องกับอุตสาหกรรม หมวดที่เป็น Positive list โดยใช้หลักฐานเพิ่มเติมได้แก่",
            "> - เอกสารที่ออกโดยหน่วยงานภาครัฐที่แสดงถึงการผลิต และ/หรือ",
            "> - รูปถ่าย เครื่องจักร อุปกรณ์ และสถานที่ผลิต",
          ],
        },
      ],
    },
    associate: {
      title: "สมาชิกสามัญ - สมาคมการค้า (สส)",
      description:
        "เป็นสมาคมการค้าที่ตั้งขึ้นตามกฎหมายว่าด้วย สมาคมการค้า และมีวัตถุประสงค์เพื่อส่งเสริมการประกอบอุตสาหกรรม",
      documents: ["สำเนาหนังสือรับรองการจดทะเบียนเป็นสมาคมการค้า", "รายชื่อสมาชิกสมาคม"],
    },
    supporting_corporate: {
      title: "สมาชิกสมทบ - นิติบุคคล (ทน)",
      description:
        "เป็นนิติบุคคลที่ตั้งขึ้นตามกฎหมายไทย และประกอบธุรกิจการค้า/ให้บริการ แต่มิได้ประกอบอุตสาหกรรมจากการผลิต",
      documents: ["สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล"],
    },
    supporting_individual: {
      title: "สมาชิกสมทบ - บุคคลธรรมดา (ทบ)",
      description: "เป็นบุคคลธรรมดา ที่ไม่ได้จดทะเบียนนิติบุคคล",
      documents: ["สำเนาบัตรประชาชน", "สำเนาใบทะเบียนพาณิชย์ (ถ้ามี)"],
    },
  };

  // Pagination logic
  const totalPages = Math.ceil(benefits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBenefits = showAllBenefits
    ? benefits.slice(startIndex, endIndex)
    : benefits.slice(0, 10);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleApply = (path) => {
    // Avoid action while auth state is loading
    if (isLoading) return;
    if (!user) {
      const redirect = encodeURIComponent(path);
      router.push(`/login?redirect=${redirect}`);
    } else {
      router.push(path);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* Decorative elements */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}

          {/* Membership icon */}
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
                  d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1 10H23"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 16H8.01"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 16H12.01"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 16H16.01"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">ประเภทสมาชิก ส.อ.ท.</h1>
            <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              เลือกประเภทสมาชิกที่เหมาะกับธุรกิจของคุณ
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">สมาชิกสภาอุตสาหกรรม</h2>
          </div>

          {/* Step Workflow */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">ขั้นตอนการสมัคร</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1 */}
              <div className="flex items-center md:flex-1">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 21v-2a4 4 0 014-4h0a4 4 0 014 4v2M16 11h6m-3-3v6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-500">ขั้นตอนที่ 1</p>
                    <p className="font-medium text-blue-900">สมาชิกสมัครผ่านระบบออนไลน์</p>
                  </div>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-center md:flex-1">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-500">ขั้นตอนที่ 2</p>
                    <p className="font-medium text-blue-900">
                      เจ้าหน้าที่ตรวจสอบข้อมูล และรับใบแจ้งหนี้ผ่านอีเมล
                    </p>
                  </div>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-center md:flex-1">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" strokeWidth="2" />
                      <path d="M2 10h20" strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-500">ขั้นตอนที่ 3</p>
                    <p className="font-medium text-blue-900">ชำระเงิน</p>
                  </div>
                </div>
              </div>
              {/* Step 4 */}
              <div className="flex items-center md:flex-1">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-500">ขั้นตอนที่ 4</p>
                    <p className="font-medium text-blue-900">รอรับจดหมายยืนยันทางไปรษณีย์</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Cards Section */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-blue-900 mb-12 text-center">
              แพ็กเกจสมาชิก
              <div className="w-16 h-1 bg-blue-600 mx-auto mt-3"></div>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {membershipTypes.map((type) => (
                <div
                  key={type.id}
                  className={`bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-105 ${
                    type.highlight ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  {type.highlight && (
                    <div className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mb-2">
                      แนะนำ
                    </div>
                  )}
                  <h4 className="text-xl font-bold mb-2 text-blue-900">{type.name}</h4>
                  <p className="text-sm text-blue-600 mb-4">{type.description}</p>
                  <div className="text-2xl font-bold mb-4 text-blue-600">
                    {type.feeText ? type.feeText : `${type.annual_fee.toLocaleString()} บาท/ปี`}
                  </div>
                  <ul className="mb-6 space-y-2">
                    {type.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleApply(type.path)}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Document Requirements Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h3 className="text-2xl font-bold mb-2">เอกสารประกอบการรับสมัครสมาชิก</h3>
              <p className="opacity-90">เอกสารที่จำเป็นสำหรับการสมัครสมาชิกประเภทต่างๆ</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b bg-gray-50">
              <div className="flex overflow-x-auto">
                {Object.entries(documentRequirements).map(([key, requirement]) => (
                  <button
                    key={key}
                    onClick={() => setActiveDocumentTab(key)}
                    className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeDocumentTab === key
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"
                    }`}
                  >
                    {requirement.title.split(" - ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {Object.entries(documentRequirements).map(([key, requirement]) => (
                <div key={key} className={`${activeDocumentTab === key ? "block" : "hidden"}`}>
                  <div className="mb-6">
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-blue-900 mb-2">{requirement.title}</h4>
                      <p className="text-gray-600">{requirement.description}</p>
                    </div>
                  </div>

                  {/* Categories for ordinary membership */}
                  {requirement.categories && (
                    <div className="space-y-6">
                      {requirement.categories.map((category, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg"
                        >
                          <h5 className="font-semibold text-blue-900 mb-2">
                            {category.title}: {category.subtitle}
                          </h5>
                          <ul className="space-y-2">
                            {category.requirements.map((req, idx) => (
                              <li key={idx} className="text-gray-700 leading-relaxed">
                                {req.startsWith(">") ? (
                                  <span className="ml-4 text-gray-600">{req}</span>
                                ) : (
                                  <span className="flex items-start">
                                    <span className="text-blue-600 mr-2 font-bold">•</span>
                                    {req}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Documents for other membership types */}
                  {requirement.documents && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <svg
                          className="w-5 h-5 text-blue-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        เอกสารประกอบ
                      </h5>
                      <ul className="space-y-2">
                        {requirement.documents.map((doc, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <svg
                              className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium text-blue-800">หมายเหตุ</span>
                    </div>
                    <p className="text-blue-700 mt-1 text-sm">
                      เอกสารทั้งหมด ให้รับรองสำเนาถูกต้อง
                      หากไม่ครบถ้วนเจ้าหน้าที่อาจขอเอกสารเพิ่มเติม
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Comparison Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-50 p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-blue-900">
                  เปรียบเทียบสิทธิประโยชน์ทั้งหมด
                </h3>
                <button
                  onClick={() => setShowAllBenefits(!showAllBenefits)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {showAllBenefits ? "ซ่อนรายละเอียด" : "ดูสิทธิประโยชน์ทั้งหมด"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-blue-900 border-b w-1/2">
                      สิทธิประโยชน์ ({benefits.length} รายการ)
                    </th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-blue-600 border-b">
                      สามัญ-โรงงาน (สน)
                      <br />
                      <span className="text-xs font-normal">12,000 บาท</span>
                    </th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-blue-600 border-b">
                      สามัญ-สมาคมการค้า (สส)
                      <br />
                      <span className="text-xs font-normal">8,000 บาท</span>
                    </th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-blue-600 border-b">
                      สมทบ-นิติบุคคล (ทน)
                      <br />
                      <span className="text-xs font-normal">6,000 บาท</span>
                    </th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-blue-600 border-b">
                      สมทบ-บุคคลธรรมดา (ทบ)
                      <br />
                      <span className="text-xs font-normal">3,000 บาท</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBenefits.map((benefit, index) => (
                    <tr key={benefit.id} className={index % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                      <td className="py-3 px-6 text-sm text-gray-900 border-b">
                        <span className="font-medium text-blue-600 mr-2">{benefit.id}.</span>
                        {benefit.title}
                      </td>
                      <td className="py-3 px-4 text-center border-b">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            benefit.ordinary
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {benefit.ordinary ? "✓" : "×"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center border-b">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            benefit.associate
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {benefit.associate ? "✓" : "×"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center border-b">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            benefit.supporting
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {benefit.supporting ? "✓" : "×"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center border-b">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            benefit.supporting
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {benefit.supporting ? "✓" : "×"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {showAllBenefits && (
              <div className="bg-blue-50 p-6 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  {/* Page Info */}
                  <div className="text-sm text-blue-600">
                    แสดง {startIndex + 1}-{Math.min(endIndex, benefits.length)} จาก{" "}
                    {benefits.length} รายการ
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      ← ก่อนหน้า
                    </button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      ถัดไป →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!showAllBenefits && benefits.length > 10 && (
              <div className="bg-blue-50 p-4 text-center border-t">
                <p className="text-blue-600 text-sm">
                  และอีก {benefits.length - 10} รายการ -
                  <button
                    onClick={() => {
                      setShowAllBenefits(true);
                      setCurrentPage(1);
                    }}
                    className="ml-1 text-blue-700 hover:text-blue-800 font-medium"
                  >
                    คลิกเพื่อดูทั้งหมด
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-6 text-white">
              <div className="text-center">
                <h4 className="text-lg font-semibold">ทบ สมทบ-บุคคลธรรมดา</h4>
                <p className="text-2xl font-bold mt-2">
                  {benefits.filter((b) => b.supporting).length} สิทธิ
                </p>
                <p className="text-sm opacity-90">จาก {benefits.length} สิทธิทั้งหมด</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="text-center">
                <h4 className="text-lg font-semibold">ทน สมทบ-นิติบุคคล</h4>
                <p className="text-2xl font-bold mt-2">
                  {benefits.filter((b) => b.supporting).length} สิทธิ
                </p>
                <p className="text-sm opacity-90">จาก {benefits.length} สิทธิทั้งหมด</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <div className="text-center">
                <h4 className="text-lg font-semibold">สส สามัญ-สมาคมการค้า</h4>
                <p className="text-2xl font-bold mt-2">
                  {benefits.filter((b) => b.associate).length} สิทธิ
                </p>
                <p className="text-sm opacity-90">จาก {benefits.length} สิทธิทั้งหมด</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg p-6 text-white">
              <div className="text-center">
                <h4 className="text-lg font-semibold">สน สามัญ-โรงงาน</h4>
                <p className="text-2xl font-bold mt-2">
                  {benefits.filter((b) => b.ordinary).length} สิทธิ
                </p>
                <p className="text-sm opacity-90">จาก {benefits.length} สิทธิทั้งหมด</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">คำถามที่พบบ่อย</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-900 text-lg">
                  ฉันสามารถเปลี่ยนประเภทสมาชิกได้ตลอดเวลาหรือไม่?
                </h4>
                <p className="mt-2 text-gray-700">
                  ท่านสามารถอัพเกรดประเภทสมาชิกได้ตลอดเวลา โดยจะมีผลทันทีหลังจากชำระค่าสมาชิก
                  และจะได้รับสิทธิประโยชน์เพิ่มเติมตามระดับสมาชิกใหม่
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-900 text-lg">
                  สมาชิกแต่ละประเภทมีเงื่อนไขการสมัครต่างกันอย่างไร?
                </h4>
                <p className="mt-2 text-gray-700">
                  <strong>สมาชิกสามัญ-โรงงาน:</strong> ต้องเป็นผู้ประกอบการในภาคอุตสาหกรรมโรงงาน
                  <br />
                  <strong>สมาชิกสามัญ-สมาคมการค้า:</strong>{" "}
                  ต้องเป็นสมาคมการค้าที่เกี่ยวข้องกับอุตสาหกรรม
                  <br />
                  <strong>สมาชิกสมทบ-นิติบุคคล:</strong> สำหรับนิติบุคคลที่ทำงานด้านอุตสาหกรรม
                  <br />
                  <strong>สมาชิกสมทบ-บุคคลธรรมดา:</strong>{" "}
                  เปิดให้บุคคลทั่วไปที่สนใจงานด้านอุตสาหกรรม
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-900 text-lg">
                  สิทธิประโยชน์ที่สำคัญที่สุดคืออะไร?
                </h4>
                <p className="mt-2 text-gray-700">
                  สิทธิประโยชน์ที่โดดเด่นได้แก่ การได้รับข้อมูลข่าวสารอุตสาหกรรม,
                  การเข้าถึงเครือข่ายธุรกิจ, บัตร FTI e-Member Card สำหรับส่วนลดต่างๆ,
                  และการเข้าร่วมโครงการพัฒนาธุรกิจต่างๆ ของสภาอุตสาหกรรม
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-900 text-lg">
                  ฉันจะได้รับประโยชน์จากการเป็นสมาชิกอย่างไร?
                </h4>
                <p className="mt-2 text-gray-700">
                  สมาชิกจะได้รับการสนับสนุนในการพัฒนาธุรกิจ ลดต้นทุนการดำเนินงาน
                  เข้าถึงข้อมูลข่าวสารและกฎระเบียบที่เกี่ยวข้อง สร้างเครือข่ายธุรกิจ
                  และได้รับสิทธิพิเศษในการใช้บริการต่างๆ ของสภาอุตสาหกรรม
                </p>
              </div>
            </div>
          </div>

          {/* Preface Banner */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: question and copy */}
              <div className="p-6 md:p-8">
                <p className="text-blue-600 font-semibold text-lg mb-2">
                  พร้อมที่จะเริ่มต้นแล้วหรือยัง?
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">สมาชิก ส.อ.ท.</h3>
                <div className="flex items-end space-x-3 mb-3">
                  <span className="text-red-600 font-extrabold text-4xl md:text-5xl leading-none">
                    {memberCount.toLocaleString("th-TH")}
                  </span>
                  <span className="text-red-500 mb-1">ราย</span>
                </div>
                <p className="text-gray-700">
                  มาร่วมเป็นส่วนหนึ่งในการขับเคลื่อน อุตสาหกรรมไทย พร้อมรับสิทธิประโยชน์
                </p>
                <p className="text-gray-700">ให้ธุรกิจไปได้ไกลยิ่งขึ้น</p>
              </div>
              {/* Right: tiny upward graph with animation */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <svg viewBox="0 0 120 60" className="w-full h-32">
                    {/* axes */}
                    <line x1="5" y1="55" x2="115" y2="55" stroke="#93c5fd" strokeWidth="1" />
                    <line x1="5" y1="55" x2="5" y2="5" stroke="#93c5fd" strokeWidth="1" />
                    {/* sparkline path */}
                    <path
                      d="M5 50 L20 48 L35 45 L50 40 L65 42 L80 35 L95 28 L110 15"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="animate-dash"
                      style={{ strokeDasharray: 200, strokeDashoffset: 0 }}
                    />
                    {/* dots */}
                    <circle cx="50" cy="40" r="2.5" fill="#2563eb" />
                    <circle cx="80" cy="35" r="2.5" fill="#2563eb" />
                    <circle cx="110" cy="15" r="3" fill="#ef4444" />
                  </svg>
                </div>
              </div>
            </div>

            {/* styled-jsx animation */}
            <style jsx>{`
              @keyframes dash {
                0% {
                  stroke-dashoffset: 220;
                }
                100% {
                  stroke-dashoffset: 0;
                }
              }
              .animate-dash {
                animation: dash 2s ease-in-out infinite alternate;
              }
            `}</style>
          </div>

          {/* Additional Information Section */}
          <div className="bg-blue-50 py-12 md:py-16 rounded-lg">
            <div className="container mx-auto px-4 text-center max-w-3xl">
              <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">
                ต้องการข้อมูลเพิ่มเติม?
                <div className="w-16 h-1 bg-blue-600 mx-auto mt-3"></div>
              </h3>
              <p className="text-lg text-blue-700 mb-8">
                หากคุณมีคำถามเกี่ยวกับประเภทสมาชิกหรือต้องการคำปรึกษา โปรดติดต่อเรา
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-block bg-white text-blue-900 font-semibold px-8 py-3 rounded-full border-2 border-blue-900 hover:bg-blue-900 hover:text-white transition-colors">
                  ติดต่อเรา
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
