"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";

export default function MembershipCards() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

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

  const handleApply = (path) => {
    if (isLoading) return;
    if (!user) {
      const redirect = encodeURIComponent(path);
      router.push(`/login?redirect=${redirect}`);
    } else {
      router.push(path);
    }
  };

  return (
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
  );
}