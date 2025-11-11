"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const toHumanPrice = (price, decimals = 2) => {
  return Number(price / 100).toFixed(decimals);
};

const demoPrices = [
  {
    id: "price_1",
    name: "บุคคลธรรมดา",
    description: "สำหรับบุคคลทั่วไปที่สนใจเข้าร่วมเป็นสมาชิก",
    features: [
      "เข้าร่วมกิจกรรมของสภาอุตสาหกรรม",
      "รับข้อมูลข่าวสารจากภาคอุตสาหกรรม",
      "เครือข่ายธุรกิจอุตสาหกรรม",
      "สิทธิ์เข้าประชุมสามัญประจำปี",
    ],
    monthlyPrice: 3000,
    yearlyPrice: 30000,
    isMostPopular: false,
  },
  {
    id: "price_2",
    name: "นิติบุคคล สมทบ",
    description: "สำหรับองค์กรที่ต้องการสิทธิพิเศษ",
    features: [
      "สิทธิ์ทั้งหมดของบุคคลธรรมดา",
      "เข้าร่วมประชุมกรรมการ",
      "เสนอชื่อผู้แทนในคณะกรรมการ",
      "รับข่าวสารและข้อมูลพิเศษ",
      "เครือข่ายองค์กรชั้นนำ",
    ],
    monthlyPrice: 6000,
    yearlyPrice: 60000,
    isMostPopular: true,
  },
  {
    id: "price_3",
    name: "สมาคมการค้า",
    description: "สำหรับสมาคมการค้าที่เป็นสมาชิก",
    features: [
      "สิทธิ์ทั้งหมดของนิติบุคคล สมทบ",
      "เข้าร่วมการประชุมสมาคม",
      "สิทธิ์ในการเลือกตั้ง",
      "รับการสนับสนุนจากสภา",
      "เครือข่ายสมาคมการค้า",
    ],
    monthlyPrice: 8000,
    yearlyPrice: 80000,
    isMostPopular: false,
  },
  {
    id: "price_4",
    name: "โรงงานอุตสาหกรรม",
    description: "สำหรับโรงงานอุตสาหกรรมสมาชิก",
    features: [
      "สิทธิ์ทั้งหมดของสมาคมการค้า",
      "เข้าร่วมการประชุมอุตสาหกรรม",
      "รับคำปรึกษาด้านอุตสาหกรรม",
      "สิทธิ์พิเศษในการจัดงาน",
      "เครือข่ายโรงงานอุตสาหกรรม",
    ],
    monthlyPrice: 12000,
    yearlyPrice: 120000,
    isMostPopular: false,
  },
];

export default function AdditionalInfo() {
  const [interval, setInterval] = useState("year");
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(null);

  const onSubscribeClick = async (priceId) => {
    setIsLoading(true);
    setId(priceId);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate a delay
    setIsLoading(false);
  };

  return (
    <section id="pricing" className="py-12">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-blue-600 mb-2 font-medium tracking-tight">
            แพ็กเกจสมาชิก
          </h4>

          <h2 className="text-blue-900 text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            เลือกแพ็กเกจที่เหมาะสมสำหรับคุณ
          </h2>

          <p className="text-blue-700 mt-6 leading-6 text-balance lg:text-lg">
            เลือก{" "}
            <strong className="text-blue-900 font-semibold">
              แพ็กเกจที่ตรงกับความต้องการ
            </strong>{" "}
            ของคุณ พร้อมสิทธิพิเศษมากมายสำหรับการพัฒนาธุรกิจและเครือข่าย
          </p>
        </div>

        <div className="flex w-full items-center justify-center space-x-2">
          <button
            onClick={() => setInterval("month")}
            className={`px-4 py-2 rounded-l-lg border ${
              interval === "month"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
            }`}
          >
            รายเดือน
          </button>
          <button
            onClick={() => setInterval("year")}
            className={`px-4 py-2 rounded-r-lg border ${
              interval === "year"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
            }`}
          >
            รายปี
          </button>
          <span className="bg-blue-600 text-white flex h-6 w-fit items-center justify-center rounded-lg px-2 font-mono text-xs leading-5 font-semibold tracking-wide whitespace-nowrap uppercase ml-2">
            ประหยัดกว่า 2 เดือน
          </span>
        </div>

        <div className="mx-auto grid w-full justify-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {demoPrices.map((price, idx) => (
            <motion.div
              key={price.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1 + idx * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className={`text-blue-900 relative flex w-full max-w-[400px] flex-col gap-4 overflow-hidden rounded-2xl border p-4 ${
                price.isMostPopular
                  ? "border-blue-500 border-2 shadow-lg shadow-blue-200"
                  : "border-blue-200"
              }`}
            >
              {price.isMostPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    แนะนำ
                  </span>
                </div>
              )}

              <div className="flex items-center tracking-tight">
                <div>
                  <h2 className="text-lg font-semibold">{price.name}</h2>
                  <p className="text-blue-600 text-sm">{price.description}</p>
                </div>
              </div>

              <motion.div
                key={`${price.id}-${interval}`}
                initial="initial"
                animate="animate"
                variants={{
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + idx * 0.05,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="flex flex-row gap-1"
              >
                <span className="text-blue-900 text-2xl font-bold">
                  {interval === "year"
                    ? toHumanPrice(price.yearlyPrice, 0)
                    : toHumanPrice(price.monthlyPrice, 0)}
                  <span className="text-sm font-normal"> บาท/{interval === "year" ? "ปี" : "เดือน"}</span>
                </span>
              </motion.div>

              <button
                className={`group text-white relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter rounded-lg py-3 px-4 transform-gpu transition-all duration-300 ease-out ${
                  price.isMostPopular
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isLoading}
                onClick={() => void onSubscribeClick(price.id)}
              >
                <span className="bg-white/20 absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform-gpu opacity-50 transition-all duration-1000 ease-out group-hover:-translate-x-96" />
                {(!isLoading || (isLoading && id !== price.id)) && (
                  <span>สมัครสมาชิก</span>
                )}

                {isLoading && id === price.id && <span>กำลังดำเนินการ</span>}
                {isLoading && id === price.id && (
                  <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />
                )}
              </button>

              <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-blue-200/0 via-blue-300/30 to-blue-200/0" />
              {price.features && price.features.length > 0 && (
                <ul className="text-blue-700 flex flex-col gap-2 font-normal">
                  {price.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-blue-700 flex items-center gap-3 text-sm font-medium"
                    >
                      <Check className="bg-blue-600 text-white size-4 shrink-0 rounded-full p-[2px]" />
                      <span className="flex">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}