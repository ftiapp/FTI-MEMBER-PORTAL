'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Sitemap = () => {
  const pathname = usePathname();
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

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1
      }
    }
  };

  // Site structure
  const siteStructure = [
    {
      title: 'หน้าหลัก',
      links: [
        { name: 'หน้าแรก', path: '/' },
        { name: 'เกี่ยวกับเรา', path: '/about' },
        { name: 'บริการของเรา', path: '/services' },
        { name: 'ติดต่อเรา', path: '/contact' },
      ]
    },
    {
      title: 'สมาชิก',
      links: [
        { name: 'สมัครสมาชิก', path: '/register' },
        { name: 'เข้าสู่ระบบ', path: '/login' },
        { name: 'ลืมรหัสผ่าน', path: '/forgot-password' },
        { name: 'รีเซ็ตรหัสผ่าน', path: '/reset-password' },
        { name: 'ยืนยันอีเมล', path: '/verify-email' },
        { name: 'เปลี่ยนอีเมล', path: '/ChangeEmail' },
      ]
    },
    {
      title: 'แดชบอร์ด',
      links: [
        { name: 'แดชบอร์ดสมาชิก', path: '/dashboard' },
        { name: 'ข้อมูลสมาชิก', path: '/MemberDetail' },
        { name: 'สมาชิกภาพ', path: '/membership' },
        { name: 'อัพเกรดสมาชิกภาพ', path: '/membership/upgrade' },
      ]
    },
    {
      title: 'ข้อมูลทั่วไป',
      links: [
        { name: 'นโยบายความเป็นส่วนตัว', path: '/privacy-policy' },
        { name: 'เงื่อนไขการใช้บริการ', path: '/terms-of-service' },
        { name: 'แผนผังเว็บไซต์', path: '/sitemap' },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section - ใช้แบบเดียวกับหน้าอื่น */}
      <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
        {/* ลด decorative elements ในมือถือ */}
        {!isMobile && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
          </>
        )}
        
        {/* Sitemap icon - ซ่อนในมือถือ */}
        {!isMobile && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9C9.53043 3 10.0391 3.21071 10.4142 3.58579C10.7893 3.96086 11 4.46957 11 5V7C11 7.53043 10.7893 8.03914 10.4142 8.41421C10.0391 8.78929 9.53043 9 9 9H5C4.46957 9 3.96086 8.78929 3.58579 8.41421C3.21071 8.03914 3 7.53043 3 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 19V17C13 16.4696 13.2107 15.9609 13.5858 15.5858C13.9609 15.2107 14.4696 15 15 15H19C19.5304 15 20.0391 15.2107 20.4142 15.5858C20.7893 15.9609 21 16.4696 21 17V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15C14.4696 21 13.9609 20.7893 13.5858 20.4142C13.2107 20.0391 13 19.5304 13 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 19V17C3 16.4696 3.21071 15.9609 3.58579 15.5858C3.96086 15.2107 4.46957 15 5 15H9C9.53043 15 10.0391 15.2107 10.4142 15.5858C10.7893 15.9609 11 16.4696 11 17V19C11 19.5304 10.7893 20.0391 10.4142 20.4142C10.0391 20.7893 9.53043 21 9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 7V5C13 4.46957 13.2107 3.96086 13.5858 3.58579C13.9609 3.21071 14.4696 3 15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V7C21 7.53043 20.7893 8.03914 20.4142 8.41421C20.0391 8.78929 19.5304 9 19 9H15C14.4696 9 13.9609 8.78929 13.5858 8.41421C13.2107 8.03914 13 7.53043 13 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 9V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 9V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            แผนผังเว็บไซต์
          </h1>
          <motion.div 
            className="w-24 h-1 bg-white mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
            รวมลิงก์ทั้งหมดของเว็บไซต์สภาอุตสาหกรรมแห่งประเทศไทย
          </p>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-7xl">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          หมวดหมู่เนื้อหา
          <motion.div 
            className="w-16 h-1 bg-blue-600 mx-auto mt-3"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </motion.h2>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {siteStructure.map((section, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6"
              variants={fadeInUp}
              transition={{ delay: index * (isMobile ? 0.05 : 0.1) }}
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b border-gray-200">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.path}
                      className={`flex items-center text-gray-700 hover:text-blue-600 transition-colors ${pathname === link.path ? 'text-blue-600 font-medium' : ''}`}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-2 text-blue-500" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Information */}
        <motion.div 
          className="bg-blue-50 p-6 md:p-8 rounded-xl"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-blue-800 mb-4">
            ข้อมูลเพิ่มเติม
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">การนำทาง</h4>
              <p className="text-sm">
                เว็บไซต์ของเราออกแบบมาให้ใช้งานง่าย สามารถเข้าถึงข้อมูลและบริการต่างๆ ได้อย่างสะดวกและรวดเร็ว
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">การสนับสนุน</h4>
              <p className="text-sm">
                หากท่านมีข้อสงสัยหรือต้องการความช่วยเหลือ สามารถติดต่อเราผ่านหน้า <Link href="/contact" className="text-blue-600 hover:underline">ติดต่อเรา</Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-8 text-center"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">ลิงก์ด่วน</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              สมัครสมาชิก
            </Link>
            <Link 
              href="/login"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link 
              href="/contact"
              className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              ติดต่อเรา
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Sitemap;