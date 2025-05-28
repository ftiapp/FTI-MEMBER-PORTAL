'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section with consistent header pattern */}
        <motion.div 
          className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-blue-800 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
          
          {/* Shield icon for privacy */}
          <motion.div 
            className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 0.15, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <motion.h1 
              className="text-3xl md:text-5xl font-bold mb-4 text-center"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            >
              นโยบายความเป็นส่วนตัว
            </motion.h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.p 
              className="text-lg md:text-xl text-center max-w-3xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              ข้อมูลเกี่ยวกับนโยบายความเป็นส่วนตัวของสภาอุตสาหกรรมแห่งประเทศไทย
            </motion.p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          className="container mx-auto px-4 py-12 md:py-16"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto relative overflow-hidden"
            variants={fadeIn}
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-50 rounded-full -ml-20 -mb-20"></div>
            <div className="relative z-10">
            <motion.h2 
              className="text-2xl font-bold text-gray-800 mb-6"
              variants={fadeIn}
            >
              นโยบายความเป็นส่วนตัว
            </motion.h2>
            
            <motion.div 
              className="space-y-6 text-gray-600"
              variants={fadeIn}
            >
              <p>
                สภาอุตสาหกรรมแห่งประเทศไทย ("สภาอุตสาหกรรมฯ") ให้ความสำคัญกับความเป็นส่วนตัวของข้อมูลส่วนบุคคลของท่าน 
                และมุ่งมั่นที่จะคุ้มครองข้อมูลส่วนบุคคลของท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h3>
              <p>
                เราอาจเก็บรวบรวมข้อมูลส่วนบุคคลของท่านจากการที่ท่านลงทะเบียนเป็นสมาชิก การใช้บริการ การติดต่อสอบถาม 
                หรือการเข้าร่วมกิจกรรมต่างๆ ของสภาอุตสาหกรรมฯ ซึ่งข้อมูลส่วนบุคคลที่เราเก็บรวบรวมอาจรวมถึง:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>ข้อมูลส่วนตัว เช่น ชื่อ-นามสกุล ที่อยู่ อีเมล หมายเลขโทรศัพท์</li>
                <li>ข้อมูลบริษัท เช่น ชื่อบริษัท ตำแหน่ง ประเภทธุรกิจ</li>
                <li>ข้อมูลการเงิน เช่น ข้อมูลการชำระค่าสมาชิก</li>
                <li>ข้อมูลการใช้งานเว็บไซต์ เช่น IP Address, Cookies</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล</h3>
              <p>
                เราเก็บรวบรวมข้อมูลส่วนบุคคลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>เพื่อการบริหารจัดการสมาชิกและการให้บริการต่างๆ</li>
                <li>เพื่อการติดต่อสื่อสารและประชาสัมพันธ์กิจกรรมต่างๆ</li>
                <li>เพื่อการวิเคราะห์และพัฒนาบริการให้ตรงกับความต้องการของสมาชิก</li>
                <li>เพื่อการปฏิบัติตามกฎหมายและระเบียบที่เกี่ยวข้อง</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. การเปิดเผยข้อมูล</h3>
              <p>
                เราอาจเปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลหรือหน่วยงานดังต่อไปนี้:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>หน่วยงานภายในของสภาอุตสาหกรรมฯ ที่เกี่ยวข้องกับการให้บริการแก่ท่าน</li>
                <li>ผู้ให้บริการภายนอกที่เราใช้ในการดำเนินงาน เช่น ผู้ให้บริการด้านเทคโนโลยีสารสนเทศ</li>
                <li>หน่วยงานรัฐหรือหน่วยงานกำกับดูแลตามที่กฎหมายกำหนด</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. สิทธิของเจ้าของข้อมูล</h3>
              <p>
                ท่านมีสิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่านตามที่กำหนดไว้ในพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ซึ่งรวมถึง:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>สิทธิในการเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคล</li>
                <li>สิทธิในการแก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง</li>
                <li>สิทธิในการลบหรือทำลายข้อมูลส่วนบุคคล</li>
                <li>สิทธิในการระงับการใช้ข้อมูลส่วนบุคคล</li>
                <li>สิทธิในการคัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. การติดต่อ</h3>
              <p>
                หากท่านมีข้อสงสัยหรือต้องการใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่าน สามารถติดต่อเราได้ที่:
              </p>
              <p className="font-medium">
                สภาอุตสาหกรรมแห่งประเทศไทย<br />
                เลขที่ 1126/1 อาคารพญาไทพลาซ่า ชั้น 9 ถนนพญาไท แขวงถนนพญาไท เขตราชเทวี กรุงเทพฯ 10400<br />
                โทรศัพท์: 0-2345-1000<br />
                อีเมล: info@fti.or.th
              </p>
            </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
