'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FAQ() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [openQuestion, setOpenQuestion] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // FAQ Categories
  const categories = [
    { id: 'general', name: 'คำถามทั่วไป' },
    { id: 'membership', name: 'สมาชิกภาพ' },
    { id: 'services', name: 'บริการ' },
    { id: 'technical', name: 'ด้านเทคนิค' },
    { id: 'contact', name: 'การติดต่อ' }
  ];

  // FAQ Questions and Answers
  const faqData = {
    general: [
      {
        question: 'สภาอุตสาหกรรมแห่งประเทศไทยคืออะไร?',
        answer: 'สภาอุตสาหกรรมแห่งประเทศไทย เป็นสถาบันที่จัดตั้งขึ้นตามพระราชบัญญัติสภาอุตสาหกรรมแห่งประเทศไทย พ.ศ. 2530 เพื่อเป็นตัวแทนของผู้ประกอบการอุตสาหกรรมภาคเอกชน ในการประสานนโยบายและดำเนินงานระหว่างภาครัฐและเอกชน รวมถึงส่งเสริมและพัฒนาการประกอบอุตสาหกรรมในประเทศไทย'
      },
      {
        question: 'สภาอุตสาหกรรมแห่งประเทศไทยก่อตั้งเมื่อใด?',
        answer: 'สภาอุตสาหกรรมแห่งประเทศไทยเริ่มต้นในนาม สมาคมอุตสาหกรรมไทย (The Association of Thai Industries – ATI) ในปี พ.ศ. 2510 และได้รับการยกฐานะเป็นสภาอุตสาหกรรมแห่งประเทศไทยในปี พ.ศ. 2530 ตามพระราชบัญญัติสภาอุตสาหกรรมแห่งประเทศไทย'
      },
      {
        question: 'สภาอุตสาหกรรมแห่งประเทศไทยมีบทบาทอะไรบ้าง?',
        answer: 'สภาอุตสาหกรรมแห่งประเทศไทยมีบทบาทหลายด้าน ได้แก่ การเป็นตัวแทนผู้ประกอบการอุตสาหกรรมในการประสานงานกับภาครัฐ, การส่งเสริมและพัฒนาอุตสาหกรรม, การให้คำปรึกษาและข้อเสนอแนะแก่รัฐบาล, การสนับสนุนการศึกษาและวิจัย, และการประสานความสัมพันธ์กับต่างประเทศ'
      }
    ],
    membership: [
      {
        question: 'ใครสามารถสมัครเป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยได้บ้าง?',
        answer: 'ผู้ประกอบการอุตสาหกรรมทั้งบุคคลธรรมดาและนิติบุคคลที่ประกอบกิจการโรงงานตามกฎหมายว่าด้วยโรงงาน หรือประกอบกิจการอุตสาหกรรมตามที่กำหนดในกฎกระทรวง สามารถสมัครเป็นสมาชิกสภาอุตสาหกรรมแห่งประเทศไทยได้'
      },
      {
        question: 'มีประเภทของสมาชิกกี่ประเภท?',
        answer: 'สภาอุตสาหกรรมแห่งประเทศไทยมีสมาชิก 2 ประเภทหลัก คือ สมาชิกสามัญ (ผู้ประกอบการอุตสาหกรรม) และสมาชิกวิสามัญ (ผู้ประกอบธุรกิจที่เกี่ยวข้องกับอุตสาหกรรม)'
      },
      {
        question: 'สิทธิประโยชน์ของการเป็นสมาชิกมีอะไรบ้าง?',
        answer: 'สมาชิกจะได้รับสิทธิประโยชน์หลายด้าน เช่น การเข้าถึงข้อมูลและบริการต่างๆ ของสภาอุตสาหกรรมฯ, การเข้าร่วมกิจกรรมและการสัมมนา, การรับคำปรึกษาด้านธุรกิจและอุตสาหกรรม, การสร้างเครือข่ายทางธุรกิจ, และการได้รับการสนับสนุนในการแก้ไขปัญหาต่างๆ ที่เกี่ยวข้องกับอุตสาหกรรม'
      },
      {
        question: 'ค่าธรรมเนียมในการสมัครสมาชิกเท่าไหร่?',
        answer: 'ค่าธรรมเนียมในการสมัครสมาชิกจะแตกต่างกันตามประเภทของสมาชิกและขนาดของกิจการ โดยมีทั้งค่าแรกเข้าและค่าบำรุงรายปี สามารถดูรายละเอียดเพิ่มเติมได้ที่หน้าสมัครสมาชิก หรือติดต่อฝ่ายสมาชิกสัมพันธ์'
      }
    ],
    services: [
      {
        question: 'สภาอุตสาหกรรมแห่งประเทศไทยมีบริการอะไรให้แก่สมาชิกบ้าง?',
        answer: 'สภาอุตสาหกรรมฯ มีบริการหลากหลาย เช่น การให้คำปรึกษาด้านธุรกิจและอุตสาหกรรม, การจัดอบรมและสัมมนา, การให้ข้อมูลข่าวสารด้านอุตสาหกรรม, การสนับสนุนการส่งออก, การรับรองมาตรฐานต่างๆ, และการช่วยเหลือในการแก้ไขปัญหาที่เกี่ยวข้องกับภาครัฐ'
      },
      {
        question: 'สภาอุตสาหกรรมแห่งประเทศไทยมีการจัดอบรมหรือสัมมนาอะไรบ้าง?',
        answer: 'สภาอุตสาหกรรมฯ มีการจัดอบรมและสัมมนาในหลากหลายหัวข้อที่เกี่ยวข้องกับอุตสาหกรรม เช่น การพัฒนาเทคโนโลยีการผลิต, การบริหารจัดการธุรกิจ, กฎหมายและระเบียบที่เกี่ยวข้องกับอุตสาหกรรม, การค้าระหว่างประเทศ, และการพัฒนาอย่างยั่งยืน'
      },
      {
        question: 'สภาอุตสาหกรรมแห่งประเทศไทยมีการสนับสนุนด้านการส่งออกอย่างไรบ้าง?',
        answer: 'สภาอุตสาหกรรมฯ สนับสนุนด้านการส่งออกผ่านการให้ข้อมูลเกี่ยวกับตลาดต่างประเทศ, การจัดกิจกรรมจับคู่ธุรกิจ (Business Matching), การเข้าร่วมงานแสดงสินค้าในต่างประเทศ, การให้คำปรึกษาด้านกฎระเบียบการส่งออก, และการประสานงานกับหน่วยงานภาครัฐที่เกี่ยวข้องกับการส่งออก'
      }
    ],
    technical: [
      {
        question: 'ฉันลืมรหัสผ่านในการเข้าสู่ระบบ ต้องทำอย่างไร?',
        answer: 'คุณสามารถคลิกที่ลิงก์ "ลืมรหัสผ่าน" ที่หน้าเข้าสู่ระบบ จากนั้นกรอกอีเมลที่ใช้ลงทะเบียน ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณ'
      },
      {
        question: 'ฉันต้องการเปลี่ยนอีเมลที่ใช้ในการติดต่อ ต้องทำอย่างไร?',
        answer: 'คุณสามารถเปลี่ยนอีเมลได้โดยเข้าสู่ระบบ แล้วไปที่หน้าโปรไฟล์ของคุณ จากนั้นคลิกที่ "เปลี่ยนอีเมล" และทำตามขั้นตอนที่ระบบแนะนำ ระบบจะส่งอีเมลยืนยันไปยังอีเมลใหม่ของคุณ'
      },
      {
        question: 'ฉันไม่ได้รับอีเมลยืนยันการลงทะเบียน ต้องทำอย่างไร?',
        answer: 'หากคุณไม่ได้รับอีเมลยืนยันการลงทะเบียน คุณสามารถลองตรวจสอบโฟลเดอร์สแปมหรือถังขยะในอีเมลของคุณก่อน หากยังไม่พบ คุณสามารถขอให้ระบบส่งอีเมลยืนยันใหม่ได้โดยเข้าไปที่หน้าเข้าสู่ระบบ แล้วคลิกที่ "ส่งอีเมลยืนยันอีกครั้ง" หรือติดต่อฝ่ายสมาชิกสัมพันธ์เพื่อขอความช่วยเหลือ'
      },
      {
        question: 'ฉันต้องการอัปเดตข้อมูลบริษัท ต้องทำอย่างไร?',
        answer: 'คุณสามารถอัปเดตข้อมูลบริษัทได้โดยเข้าสู่ระบบ แล้วไปที่หน้าแดชบอร์ด จากนั้นเลือกแท็บ "ข้อมูลบริษัท" และคลิกที่ปุ่ม "แก้ไข" ในส่วนที่คุณต้องการอัปเดต หลังจากแก้ไขข้อมูลเรียบร้อยแล้ว คลิกที่ปุ่ม "บันทึก" เพื่อบันทึกการเปลี่ยนแปลง'
      }
    ],
    contact: [
      {
        question: 'ฉันจะติดต่อสภาอุตสาหกรรมแห่งประเทศไทยได้อย่างไร?',
        answer: 'คุณสามารถติดต่อสภาอุตสาหกรรมแห่งประเทศไทยได้หลายช่องทาง ดังนี้\n\n- ที่อยู่: เลขที่ 2 อาคารปฏิบัติการเทคโนโลยีเชิงสร้างสรรค์ ชั้น 7 มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ ถนนนางลิ้นจี่ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120\n- โทรศัพท์: 0-2345-1000\n- อีเมล: info@fti.or.th\n- เว็บไซต์: www.fti.or.th'
      },
      {
        question: 'สภาอุตสาหกรรมแห่งประเทศไทยมีสำนักงานสาขาในต่างจังหวัดหรือไม่?',
        answer: 'สภาอุตสาหกรรมแห่งประเทศไทยมีสภาอุตสาหกรรมจังหวัดครอบคลุมทั่วประเทศ 77 จังหวัด เพื่อให้บริการและสนับสนุนผู้ประกอบการในแต่ละพื้นที่ คุณสามารถดูรายละเอียดการติดต่อสภาอุตสาหกรรมจังหวัดได้ที่เว็บไซต์ของสภาอุตสาหกรรมแห่งประเทศไทย'
      },
      {
        question: 'ฉันมีข้อเสนอแนะหรือข้อร้องเรียน ต้องติดต่อใคร?',
        answer: 'คุณสามารถส่งข้อเสนอแนะหรือข้อร้องเรียนได้ผ่านช่องทางต่างๆ ดังนี้\n\n- ผ่านแบบฟอร์มติดต่อบนเว็บไซต์\n- อีเมลมาที่ feedback@fti.or.th\n- โทรศัพท์ติดต่อฝ่ายสมาชิกสัมพันธ์ที่ 0-2345-1000\n- ส่งจดหมายมาที่สำนักงานใหญ่ของสภาอุตสาหกรรมแห่งประเทศไทย'
      },
      {
        question: 'ฉันต้องการเข้าร่วมกิจกรรมหรือสัมมนาของสภาอุตสาหกรรมแห่งประเทศไทย ต้องทำอย่างไร?',
        answer: 'คุณสามารถดูรายละเอียดกิจกรรมและสัมมนาที่กำลังจะเกิดขึ้นได้ที่เว็บไซต์ของสภาอุตสาหกรรมแห่งประเทศไทย ในส่วนของ "กิจกรรมและข่าวสาร" หรือติดตามผ่านช่องทางโซเชียลมีเดียต่างๆ การลงทะเบียนเข้าร่วมกิจกรรมสามารถทำได้ผ่านเว็บไซต์หรือติดต่อฝ่ายจัดกิจกรรมโดยตรง'
      }
    ]
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Toggle question handler
  const toggleQuestion = (index) => {
    if (openQuestion === index) {
      setOpenQuestion(null);
    } else {
      setOpenQuestion(index);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* Decorative elements */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          {/* Question mark icon */}
          {!isMobile && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.09 9.00001C9.3251 8.33167 9.78915 7.76811 10.4 7.40914C11.0108 7.05016 11.7289 6.91894 12.4272 7.03872C13.1255 7.15849 13.7588 7.52153 14.2151 8.06353C14.6713 8.60554 14.9211 9.29153 14.92 10C14.92 12 11.92 13 11.92 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <motion.h1 
              className="text-3xl md:text-5xl font-bold mb-4 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              คำถามที่พบบ่อย
            </motion.h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <motion.p 
              className="text-lg md:text-xl text-center max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับสภาอุตสาหกรรมแห่งประเทศไทย
            </motion.p>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-5xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            {/* Category Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <div className="flex flex-wrap -mb-px">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setOpenQuestion(null);
                    }}
                    className={`inline-block p-4 rounded-t-lg mr-2 ${
                      activeCategory === category.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {faqData[activeCategory].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="flex justify-between items-center w-full p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                    <svg
                      className={`w-6 h-6 text-blue-600 transform ${
                        openQuestion === index ? 'rotate-180' : ''
                      } transition-transform duration-200`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openQuestion === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="p-5 border-t border-gray-200 bg-gray-50">
                      <p className="text-gray-700 whitespace-pre-line">{item.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Section */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">ไม่พบคำตอบที่คุณต้องการ?</h3>
              <p className="text-gray-700 text-center mb-6">
                หากคุณมีคำถามเพิ่มเติมที่ไม่ได้อยู่ในรายการด้านบน คุณสามารถติดต่อเราได้โดยตรง
              </p>
              <div className="flex justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  ติดต่อเรา
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
