import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "./shared/LoadingOverlay";
import MembershipCardsSection from "./UpgradeMembership/MembershipCardsSection";
import DocumentRequirementsSection from "./UpgradeMembership/DocumentRequirementsSection";
import HeaderBannerSection from "./UpgradeMembership/HeaderBannerSection";
import SummaryAndCTASection from "./UpgradeMembership/SummaryAndCTASection";

export default function UpgradeMembership() {
  const router = useRouter();
  const [activeDocumentTab, setActiveDocumentTab] = useState("ordinary");
  const [isLoading, setIsLoading] = useState(false);

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
            "สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล",
          ],
        },
        {
          title: "ประเภทที่ 2",
          subtitle: "ไม่มีเครื่องจักร/ มีเครื่องจักร ต่ำกว่า 50 แรงม้า",
          requirements: [
            "ไม่มีใบอนุญาตพิจารณาจากรหัส (TSIC Code) ที่จดทะเบียนกับกรมพัฒนาธุรกิจการค้ากระทรวงพาณิชย์",
            "สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล",
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
          <HeaderBannerSection memberCount={memberCount} />

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
          <MembershipCardsSection
            membershipTypes={membershipTypes}
            colorClasses={colorClasses}
            onMembershipClick={handleMembershipClick}
          />

          {/* Document Requirements Section */}
          <DocumentRequirementsSection
            documentRequirements={documentRequirements}
            activeTab={activeDocumentTab}
            onChangeTab={setActiveDocumentTab}
          />

          <SummaryAndCTASection
            membershipTypes={membershipTypes}
            benefits={benefits}
            colorClasses={colorClasses}
            onContactClick={handleContactClick}
          />
        </div>
      </div>
    </>
  );
}
