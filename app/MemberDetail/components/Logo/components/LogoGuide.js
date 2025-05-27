'use client';

import { useState } from 'react';
import { FaInfoCircle, FaChevronDown, FaChevronUp, FaImage, FaCircle, FaSquare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <FaInfoCircle className="text-blue-600 mr-2" />
          <h3 className="text-blue-800 font-medium">คำแนะนำการอัปโหลดโลโก้บริษัท</h3>
        </div>
        <button className="text-blue-600 p-1">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 text-sm text-blue-800 space-y-3">
              <p>การอัปโหลดโลโก้บริษัทจะช่วยให้ผู้ที่เข้าชมโปรไฟล์ของคุณสามารถจดจำแบรนด์ของคุณได้ง่ายขึ้น</p>
              
              <div className="space-y-2">
                <p className="font-medium">ขั้นตอนการอัปโหลดโลโก้:</p>
                <ol className="list-decimal list-inside pl-4 space-y-1">
                  <li>คลิกปุ่ม "เพิ่มโลโก้" หรือ "แก้ไขโลโก้"</li>
                  <li>เลือกไฟล์รูปภาพจากเครื่องของคุณ (รองรับไฟล์ JPEG, PNG, GIF, WebP)</li>
                  <li>เลือกรูปแบบการแสดงผล (วงกลมหรือสี่เหลี่ยม)</li>
                  <li>คลิกปุ่ม "บันทึก" เพื่อบันทึกโลโก้</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">คำแนะนำในการเตรียมไฟล์โลโก้:</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>ใช้ไฟล์ที่มีความละเอียดสูง (แนะนำอย่างน้อย 500x500 พิกเซล)</li>
                  <li>ขนาดไฟล์ไม่ควรเกิน 5MB</li>
                  <li>ควรใช้โลโก้ที่มีพื้นหลังโปร่งใส (PNG) เพื่อการแสดงผลที่ดีที่สุด</li>
                  <li>หากต้องการแสดงผลเป็นวงกลม ควรจัดวางโลโก้ให้อยู่ตรงกลางและมีระยะห่างจากขอบ</li>
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white border border-blue-200 flex items-center justify-center overflow-hidden">
                    <FaCircle className="text-blue-300 text-2xl" />
                  </div>
                  <span className="text-xs mt-1">วงกลม</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-lg bg-white border border-blue-200 flex items-center justify-center overflow-hidden">
                    <FaSquare className="text-blue-300 text-2xl" />
                  </div>
                  <span className="text-xs mt-1">สี่เหลี่ยม</span>
                </div>
              </div>
              
              <p className="italic">หมายเหตุ: ระบบจะทำการบีบอัดและปรับขนาดรูปภาพโดยอัตโนมัติเพื่อประหยัดพื้นที่จัดเก็บ</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
