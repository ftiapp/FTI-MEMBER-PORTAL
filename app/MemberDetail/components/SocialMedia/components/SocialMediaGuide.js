"use client";

import { useState } from "react";
import { FaInfoCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function SocialMediaGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <FaInfoCircle className="text-blue-600 mr-2" />
          <h3 className="text-blue-800 font-medium">คำแนะนำการเพิ่มช่องทางโซเชียลมีเดีย</h3>
        </div>
        <button className="text-blue-600 p-1">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 text-sm text-blue-800 space-y-3">
              <p>
                การเพิ่มช่องทางโซเชียลมีเดียจะช่วยให้ผู้ที่สนใจสามารถติดตามข่าวสารและติดต่อกับบริษัทของคุณได้ง่ายขึ้น
              </p>

              <div className="space-y-2">
                <p className="font-medium">ขั้นตอนการเพิ่มช่องทางโซเชียลมีเดีย:</p>
                <ol className="list-decimal list-inside pl-4 space-y-1">
                  <li>คลิกปุ่ม "เพิ่มข้อมูล" หรือ "แก้ไขข้อมูล"</li>
                  <li>เลือกแพลตฟอร์มที่ต้องการเพิ่ม</li>
                  <li>ใส่ URL หรือ Username ของช่องทางนั้นๆ</li>
                  <li>เพิ่มชื่อที่ต้องการให้แสดง (ไม่บังคับ)</li>
                  <li>คลิกปุ่ม "บันทึก" เพื่อบันทึกข้อมูล</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-medium">ช่องทางโซเชียลมีเดียที่แนะนำ:</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>
                    <span className="font-medium">พื้นฐาน:</span> Facebook Page, Line Official
                    Account, YouTube Channel, Website/Homepage
                  </li>
                  <li>
                    <span className="font-medium">เพิ่มเติม:</span> Instagram, TikTok, Twitter/X,
                    LinkedIn (สำหรับ B2B), Shopee/Lazada (ถ้าขายของออนไลน์)
                  </li>
                </ul>
              </div>

              <p className="italic">
                หมายเหตุ: ข้อมูลโซเชียลมีเดียที่เพิ่มจะแสดงในหน้าโปรไฟล์บริษัทของคุณ
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
