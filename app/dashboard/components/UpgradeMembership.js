import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "./shared/LoadingOverlay";

export default function UpgradeMembership() {
  const router = useRouter();
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDocumentTab, setActiveDocumentTab] = useState("ordinary");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const membershipTypes = [
    {
      id: "ordinary",
      title: "สามัญ-โรงงาน (สน)",
      subtitle: "สำหรับผู้ประกอบการภาคอุตสาหกรรมโรงงาน",
      price: "1,000–100,000 บาท/ปี",
      priceNote: "(คำนวณตามรายได้)",
      color: "blue",
      link: "/membership/oc",
      features: [
        "สิทธิในการเข้าร่วมประชุมใหญ่",
        "สิทธิในการออกเสียงเลือกตั้ง",
        "รับข้อมูลข่าวสารจากสภาอุตสาหกรรม",
      ],
    },
    {
      id: "associate",
      title: "สามัญ-สมาคมการค้า (สส)",
      subtitle: "สำหรับสมาคมการค้าที่เกี่ยวข้องกับอุตสาหกรรม",
      price: "10,000–100,000 บาท/ปี",
      priceNote: "(คำนวณตามจำนวนสมาชิก)",
      color: "purple",
      link: "/membership/am",
      features: [
        "สิทธิในการเข้าร่วมประชุมใหญ่",
        "รับข้อมูลข่าวสารจากสภาอุตสาหกรรม",
        "เครือข่ายธุรกิจอุตสาหกรรม",
      ],
    },
    {
      id: "supporting_corporate",
      title: "สมทบ-นิติบุคคล (ทน)",
      subtitle: "สำหรับนิติบุคคลที่ทำงานด้านอุตสาหกรรม",
      price: "2,400 บาท/ปี",
      priceNote: "",
      color: "green",
      link: "/membership/ac",
      features: [
        "เข้าร่วมกิจกรรมของสภาอุตสาหกรรม",
        "รับข้อมูลข่าวสารจากสภาอุตสาหกรรม",
        "เครือข่ายธุรกิจอุตสาหกรรม",
      ],
    },
    {
      id: "supporting_individual",
      title: "สมทบ-บุคคลธรรมดา (ทบ)",
      subtitle: "สำหรับบุคคลธรรมดาที่สนใจงานด้านอุตสาหกรรม",
      price: "600 บาท/ปี",
      priceNote: "",
      color: "amber",
      link: "/membership/ic",
      features: [
        "เข้าร่วมกิจกรรมของสภาอุตสาหกรรม",
        "รับข้อมูลข่าวสารจากสภาอุตสาหกรรม",
        "เครือข่ายธุรกิจอุตสาหกรรม",
      ],
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
            "ไม่มีใบอนุญาตพิจารณาจากรหัส (TSIC Code) ที่จดทะเบียนกับกรมพัฒนาธุรกิจการค้ากระทรวงพาณิชย์",
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

  const colorClasses = {
    blue: {
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
      text: "text-blue-600",
      light: "bg-blue-50",
    },
    purple: {
      bg: "bg-purple-600",
      hover: "hover:bg-purple-700",
      text: "text-purple-600",
      light: "bg-purple-50",
    },
    green: {
      bg: "bg-green-600",
      hover: "hover:bg-green-700",
      text: "text-green-600",
      light: "bg-green-50",
    },
    amber: {
      bg: "bg-amber-600",
      hover: "hover:bg-amber-700",
      text: "text-amber-600",
      light: "bg-amber-50",
    },
  };

  const totalPages = Math.ceil(benefits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBenefits = showAllBenefits
    ? benefits.slice(startIndex, endIndex)
    : benefits.slice(0, 10);

  const goToPage = (page) => setCurrentPage(page);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleMembershipClick = (link) => {
    setIsLoading(true);
    router.push(link);
  };

  const handleContactClick = () => {
    setIsLoading(true);
    router.push("/dashboard?tab=contact");
  };

  const [memberCount, setMemberCount] = useState(0);
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

  const MobileBenefitCard = ({ benefit, membership }) => {
    const hasAccess =
      membership === "ordinary"
        ? benefit.ordinary
        : membership === "associate"
          ? benefit.associate
          : benefit.supporting;

    return (
      <div
        className={`p-3 rounded-lg border ${hasAccess ? "border-green-200 bg-white" : "border-gray-200 bg-gray-50"}`}
      >
        <div className="flex items-start space-x-3">
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              hasAccess ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
            }`}
          >
            {hasAccess ? "✓" : "×"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-900 leading-relaxed">
              <span className="font-medium text-blue-600">#{benefit.id}</span> {benefit.title}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} message="กำลังโหลดข้อมูล..." />
      <div className="min-h-screen bg-gray-50">
        <style>{`
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

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              สมาชิกสภาอุตสาหกรรม
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              เลือกประเภทสมาชิกที่เหมาะสมกับองค์กรของคุณ
            </p>
          </div>

          {/* Preface Banner */}
          <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-blue-600 font-semibold text-base sm:text-lg mb-2">
                  พร้อมที่จะเริ่มต้นแล้วหรือยัง?
                </p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  สมาชิก ส.อ.ท.
                </h3>
                <div className="flex items-end space-x-2 sm:space-x-3 mb-3">
                  <span className="text-red-600 font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-none">
                    {memberCount.toLocaleString("th-TH")}
                  </span>
                  <span className="text-gray-500 text-base sm:text-lg mb-1">ราย</span>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  มาร่วมเป็นส่วนหนึ่งในการขับเคลื่อนอุตสาหกรรมไทย
                  พร้อมรับสิทธิประโยชน์ให้ธุรกิจไปได้ไกลยิ่งขึ้น
                </p>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <svg viewBox="0 0 120 60" className="w-full h-24 sm:h-32">
                    <line x1="5" y1="55" x2="115" y2="55" stroke="#93c5fd" strokeWidth="1" />
                    <line x1="5" y1="55" x2="5" y2="5" stroke="#93c5fd" strokeWidth="1" />
                    <path
                      d="M5 50 L20 48 L35 45 L50 40 L65 42 L80 35 L95 28 L110 15"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="animate-dash"
                      style={{ strokeDasharray: 200, strokeDashoffset: 0 }}
                    />
                    <circle cx="50" cy="40" r="2.5" fill="#2563eb" />
                    <circle cx="80" cy="35" r="2.5" fill="#2563eb" />
                    <circle cx="110" cy="15" r="3" fill="#ef4444" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Step Workflow */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              ขั้นตอนการสมัคร
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                  color: "blue",
                  step: 1,
                  title: "สมาชิกสมัครผ่านระบบออนไลน์",
                },
                {
                  icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                  color: "green",
                  step: 2,
                  title: "เจ้าหน้าที่ตรวจสอบข้อมูล และรับใบแจ้งหนี้ผ่านอีเมล",
                },
                {
                  icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
                  color: "amber",
                  step: 3,
                  title: "ชำระเงิน",
                },
                {
                  icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                  color: "purple",
                  step: 4,
                  title: "รอรับจดหมายยืนยันทางไปรษณีย์",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${item.color}-100 flex items-center justify-center flex-shrink-0`}
                  >
                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-${item.color}-600`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">ขั้นตอนที่ {item.step}</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 leading-snug">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Membership Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {membershipTypes.map((membership) => (
              <div
                key={membership.id}
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all duration-300"
              >
                <div className={`${colorClasses[membership.color].bg} text-white p-4 sm:p-5`}>
                  <h3 className="text-base sm:text-lg font-bold mb-1">{membership.title}</h3>
                  <p className="text-xs sm:text-sm opacity-90 leading-tight">
                    {membership.subtitle}
                  </p>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="mb-4">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{membership.price}</p>
                    {membership.priceNote && (
                      <p className="text-xs text-gray-500">{membership.priceNote}</p>
                    )}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {membership.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-xs sm:text-sm text-gray-700">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
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
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleMembershipClick(membership.link)}
                    className={`w-full ${colorClasses[membership.color].bg} text-white py-2.5 rounded-lg ${colorClasses[membership.color].hover} transition-colors text-sm sm:text-base font-medium`}
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Document Requirements Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                เอกสารประกอบการรับสมัครสมาชิก
              </h2>
              <p className="text-xs sm:text-sm opacity-90">
                เอกสารที่จำเป็นสำหรับการสมัครสมาชิกประเภทต่างๆ
              </p>
            </div>

            {/* Tab Navigation - Scrollable on mobile */}
            <div className="border-b bg-gray-50 overflow-x-auto">
              <div className="flex min-w-max">
                {Object.entries(documentRequirements).map(([key, requirement]) => (
                  <button
                    key={key}
                    onClick={() => setActiveDocumentTab(key)}
                    className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeDocumentTab === key
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300"
                    }`}
                  >
                    {requirement.title.split(" - ")[1] || requirement.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {Object.entries(documentRequirements).map(([key, requirement]) => (
                <div key={key} className={`${activeDocumentTab === key ? "block" : "hidden"}`}>
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {requirement.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {requirement.description}
                    </p>
                  </div>

                  {requirement.categories && (
                    <div className="space-y-4">
                      {requirement.categories.map((category, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 bg-blue-50 p-3 sm:p-4 rounded-r-lg"
                        >
                          <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                            {category.title}: {category.subtitle}
                          </h4>
                          <ul className="space-y-2">
                            {category.requirements.map((req, idx) => (
                              <li
                                key={idx}
                                className="text-xs sm:text-sm text-gray-700 leading-relaxed flex items-start"
                              >
                                <span className="text-blue-600 mr-2 font-bold">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {requirement.documents && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center text-sm sm:text-base">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2"
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
                      </h4>
                      <ul className="space-y-2">
                        {requirement.documents.map((doc, index) => (
                          <li
                            key={index}
                            className="flex items-start text-xs sm:text-sm text-gray-700"
                          >
                            <svg
                              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
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
                            <span className="leading-relaxed">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2"
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
                      <span className="font-medium text-yellow-800 text-sm">หมายเหตุ</span>
                    </div>
                    <p className="text-yellow-700 mt-1 text-xs sm:text-sm leading-relaxed">
                      เอกสารทั้งหมด ให้รับรองสำเนาถูกต้อง
                      หากไม่ครบถ้วนเจ้าหน้าที่อาจขอเอกสารเพิ่มเติม
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Comparison - Desktop Table / Mobile Cards */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="bg-gray-50 p-4 sm:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    เปรียบเทียบสิทธิประโยชน์
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    ตรวจสอบสิทธิประโยชน์ทั้งหมด {benefits.length} รายการ
                  </p>
                </div>
                <button
                  onClick={() => setShowAllBenefits(!showAllBenefits)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {showAllBenefits ? "แสดงบางส่วน" : "แสดงทั้งหมด"}
                </button>
              </div>
            </div>

            {isMobile ? (
              /* Mobile View - Tabs with Cards */
              <div>
                <div className="border-b bg-gray-50 overflow-x-auto">
                  <div className="flex">
                    {membershipTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setActiveDocumentTab(type.id)}
                        className={`flex-1 min-w-max px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                          activeDocumentTab === type.id
                            ? "border-blue-600 text-blue-600 bg-white"
                            : "border-transparent text-gray-600"
                        }`}
                      >
                        {type.title.split("-")[1] || type.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  {currentBenefits.map((benefit) => (
                    <MobileBenefitCard
                      key={benefit.id}
                      benefit={benefit}
                      membership={activeDocumentTab}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Desktop View - Simple Table */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        สิทธิประโยชน์
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-blue-600 w-32">
                        สน
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-purple-600 w-32">
                        สส
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-green-600 w-32">
                        ทน
                      </th>
                      <th className="py-3 px-4 text-center text-sm font-medium text-amber-600 w-32">
                        ทบ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentBenefits.map((benefit) => (
                      <tr key={benefit.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <span className="text-blue-600 font-medium mr-2">{benefit.id}.</span>
                          {benefit.title}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {benefit.ordinary ? (
                            <span className="text-blue-600 text-lg">✓</span>
                          ) : (
                            <span className="text-gray-300 text-lg">−</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {benefit.associate ? (
                            <span className="text-purple-600 text-lg">✓</span>
                          ) : (
                            <span className="text-gray-300 text-lg">−</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {benefit.supporting ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-gray-300 text-lg">−</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {benefit.supporting ? (
                            <span className="text-amber-600 text-lg">✓</span>
                          ) : (
                            <span className="text-gray-300 text-lg">−</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {showAllBenefits && totalPages > 1 && (
              <div className="bg-gray-50 p-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-xs text-gray-600">
                    หน้า {currentPage} จาก {totalPages}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400"
                          : "bg-white text-gray-700 border hover:bg-gray-50"
                      }`}
                    >
                      ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1.5 rounded text-xs font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400"
                          : "bg-white text-gray-700 border hover:bg-gray-50"
                      }`}
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!showAllBenefits && benefits.length > 10 && (
              <div className="bg-gray-50 p-4 text-center border-t">
                <p className="text-xs text-gray-600">
                  แสดง 10 จาก {benefits.length} รายการ
                  <button
                    onClick={() => {
                      setShowAllBenefits(true);
                      setCurrentPage(1);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ดูเพิ่มเติม
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {membershipTypes.map((type) => {
              const count = benefits.filter((b) =>
                type.id === "ordinary"
                  ? b.ordinary
                  : type.id === "associate"
                    ? b.associate
                    : b.supporting,
              ).length;

              return (
                <div
                  key={type.id}
                  className="bg-white rounded-lg border-2 border-gray-200 p-4 text-center hover:border-blue-300 transition-colors"
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[type.color].light} mb-3`}
                  >
                    <span className={`text-2xl font-bold ${colorClasses[type.color].text}`}>
                      {count}
                    </span>
                  </div>
                  <h3 className="text-xs font-medium text-gray-600 mb-1">{type.title}</h3>
                  <p className="text-xs text-gray-500">จาก {benefits.length} สิทธิ</p>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 sm:p-8 lg:p-10 text-white text-center shadow-xl">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 leading-tight">
              เลือกระดับสมาชิกที่เหมาะสมกับองค์กรของคุณและเริ่มต้นรับสิทธิประโยชน์วันนี้
            </h3>
            <button
              onClick={handleContactClick}
              className="bg-white text-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              ปรึกษาเพิ่มเติม
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
