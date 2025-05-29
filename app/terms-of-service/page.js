'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfService() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simple animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
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
          
          {/* Document icon - ซ่อนในมือถือ */}
          {!isMobile && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              ข้อกำหนดและเงื่อนไขการใช้บริการ
            </h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              ข้อกำหนดและเงื่อนไขการใช้บริการของสภาอุตสาหกรรมแห่งประเทศไทย
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
                ข้อกำหนดและเงื่อนไขการใช้บริการ
                <motion.div 
                  className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </motion.h2>
              
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  โปรดอ่านข้อกำหนดและเงื่อนไขการใช้บริการนี้อย่างละเอียดก่อนการใช้งานเว็บไซต์และบริการของสภาอุตสาหกรรมแห่งประเทศไทย ("สภาอุตสาหกรรมฯ") 
                  การใช้บริการของท่านถือเป็นการยอมรับข้อกำหนดและเงื่อนไขเหล่านี้
                </p>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. การใช้บริการ</h3>
                  <p className="mb-4">
                    ท่านตกลงที่จะใช้บริการของสภาอุตสาหกรรมฯ ตามวัตถุประสงค์ที่ชอบด้วยกฎหมายเท่านั้น และจะไม่ใช้บริการในลักษณะดังต่อไปนี้:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>ละเมิดกฎหมาย ระเบียบ หรือข้อบังคับใดๆ</li>
                    <li>ละเมิดสิทธิของบุคคลอื่น รวมถึงสิทธิในทรัพย์สินทางปัญญา</li>
                    <li>ส่งหรือเผยแพร่เนื้อหาที่ไม่เหมาะสม ผิดกฎหมาย หรือละเมิดสิทธิของบุคคลอื่น</li>
                    <li>แทรกแซง ทำลาย หรือสร้างภาระให้กับการทำงานของระบบหรือเครือข่าย</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. การสมัครสมาชิก</h3>
                  <p className="mb-4">
                    ในการสมัครเป็นสมาชิกของสภาอุตสาหกรรมฯ ท่านจะต้อง:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>ให้ข้อมูลที่ถูกต้อง เป็นปัจจุบัน และครบถ้วน</li>
                    <li>รักษาความลับของรหัสผ่านและบัญชีของท่าน</li>
                    <li>แจ้งให้สภาอุตสาหกรรมฯ ทราบทันทีหากมีการใช้บัญชีของท่านโดยไม่ได้รับอนุญาต</li>
                    <li>ปฏิบัติตามข้อกำหนดและเงื่อนไขการใช้บริการนี้</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. ทรัพย์สินทางปัญญา</h3>
                  <p>
                    เนื้อหา ข้อมูล และทรัพย์สินทางปัญญาทั้งหมดที่ปรากฏบนเว็บไซต์และบริการของสภาอุตสาหกรรมฯ เป็นทรัพย์สินของสภาอุตสาหกรรมฯ หรือบุคคลที่สามที่ได้รับอนุญาต 
                    ท่านไม่มีสิทธิที่จะทำซ้ำ ดัดแปลง เผยแพร่ หรือใช้ประโยชน์จากทรัพย์สินทางปัญญาดังกล่าวโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากสภาอุตสาหกรรมฯ หรือเจ้าของลิขสิทธิ์
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. การจำกัดความรับผิด</h3>
                  <p className="mb-4">
                    สภาอุตสาหกรรมฯ จะไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดขึ้นจากการใช้หรือไม่สามารถใช้บริการของสภาอุตสาหกรรมฯ รวมถึงแต่ไม่จำกัดเพียง:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>ความเสียหายทางตรง ทางอ้อม หรือที่เป็นผลสืบเนื่อง</li>
                    <li>การสูญเสียข้อมูล ธุรกิจ หรือกำไร</li>
                    <li>ความเสียหายที่เกิดจากการหยุดชะงักของบริการ</li>
                    <li>ความเสียหายที่เกิดจากการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. การเปลี่ยนแปลงข้อกำหนดและเงื่อนไข</h3>
                  <p>
                    สภาอุตสาหกรรมฯ อาจเปลี่ยนแปลงข้อกำหนดและเงื่อนไขการใช้บริการนี้เป็นครั้งคราว โดยจะแจ้งให้ท่านทราบผ่านทางเว็บไซต์หรือช่องทางอื่นที่เหมาะสม 
                    การใช้บริการของท่านหลังจากการเปลี่ยนแปลงดังกล่าวถือเป็นการยอมรับข้อกำหนดและเงื่อนไขที่เปลี่ยนแปลงนั้น
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">6. การติดต่อ</h3>
                  <p className="mb-4">
                    หากท่านมีข้อสงสัยหรือข้อเสนอแนะเกี่ยวกับข้อกำหนดและเงื่อนไขการใช้บริการนี้ สามารถติดต่อเราได้ที่:
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">
                      สภาอุตสาหกรรมแห่งประเทศไทย<br />
                      เลขที่ 1126/1 อาคารพญาไทพลาซ่า ชั้น 9 ถนนพญาไท แขวงถนนพญาไท เขตราชเทวี กรุงเทพฯ 10400<br />
                      โทรศัพท์: 0-2345-1000<br />
                      อีเมล: info@fti.or.th
                    </p>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500">
                    วันที่มีผลบังคับใช้: 1 มกราคม 2567<br />
                    อัปเดตล่าสุด: 1 มกราคม 2567
                  </p>
                  <div className="mt-6">
                    <Link 
                      href="/privacy-policy" 
                      className="text-blue-600 hover:text-blue-700 font-medium mr-6"
                    >
                      นโยบายความเป็นส่วนตัว
                    </Link>
                    <Link 
                      href="/contact" 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
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