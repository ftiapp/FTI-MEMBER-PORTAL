'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Membership() {
  const router = useRouter();
  const { user } = useAuth();

  const handleUpgradeClick = (type, name, fee) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/membership/upgrade?type=${type}&name=${encodeURIComponent(name)}&fee=${fee}`);
  };

  const membershipTypes = [
    {
      id: 'sn',
      name: 'สมาชิกสามัญ (สส)',
      description: 'สำหรับผู้ประกอบการอุตสาหกรรม',
      annual_fee: 12000,
      features: [
        'สิทธิในการเข้าร่วมประชุมใหญ่',
        'สิทธิในการออกเสียงเลือกตั้ง',
        'รับข้อมูลข่าวสารจากภาคอุตสาหกรรม'
      ],
      highlight: true
    },
    {
      id: 'ss',
      name: 'สมาชิกวิสามัญ (สม)',
      description: 'สำหรับผู้ประกอบการที่เกี่ยวข้องกับอุตสาหกรรม',
      annual_fee: 8000,
      features: [
        'สิทธิในการเข้าร่วมประชุมใหญ่',
        'รับข้อมูลข่าวสารจากภาคอุตสาหกรรม',
        'เครือข่ายธุรกิจอุตสาหกรรม'
      ],
      highlight: true
    },
    {
      id: 'tn',
      name: 'สมาชิกไม่มีนิติบุคคล (ทน)',
      description: 'สำหรับบุคคลทั่วไปที่ทำงานด้านอุตสาหกรรม',
      annual_fee: 6000,
      features: [
        'เข้าร่วมกิจกรรมของสภาอุตสาหกรรม',
        'รับข้อมูลข่าวสารจากภาคอุตสาหกรรม',
        'เครือข่ายธุรกิจอุตสาหกรรม'
      ]
    },
    {
      id: 'tb',
      name: 'สมาชิกสมทบ (ทบ)',
      description: 'สำหรับบุคคลทั่วไปที่สนใจงานด้านอุตสาหกรรม',
      annual_fee: 3000,
      features: [
        'เข้าร่วมกิจกรรมของสภาอุตสาหกรรม',
        'รับข้อมูลข่าวสารจากภาคอุตสาหกรรม',
        'เครือข่ายธุรกิจอุตสาหกรรม'
      ]
    }
  ];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      } 
    },
    hover: { 
      y: -10, 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300, damping: 15 } 
    }
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

  return (
    <>
      <Navbar />
      <motion.main className="bg-gray-50 min-h-screen">
        {/* Hero Section - Updated to match consistent pattern */}
        <motion.div 
          className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24"
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
          
          {/* Membership icon */}
          <motion.div 
            className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 0.15, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10H23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16H8.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 16H16.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <motion.h1 
              className="text-3xl md:text-5xl font-bold mb-4 text-center"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            >
              ประเภทสมาชิก ส.อ.ท.
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
              เลือกประเภทสมาชิกที่เหมาะกับธุรกิจของคุณ
            </motion.p>
          </div>
        </motion.div>

        {/* Membership Cards Section */}
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {membershipTypes.map((type, index) => (
              <motion.div
                key={type.id}
                className={`bg-white rounded-lg shadow-lg p-6 ${
                  type.highlight ? 'ring-2 ring-blue-500' : ''
                }`}
                variants={cardVariants}
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                {type.highlight && (
                  <motion.div 
                    className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mb-2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    แนะนำ
                  </motion.div>
                )}
                <motion.h3 
                  className="text-xl font-bold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {type.name}
                </motion.h3>
                <motion.p 
                  className="text-sm text-gray-600 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {type.description}
                </motion.p>
                <motion.div 
                  className="text-2xl font-bold mb-4 text-blue-600"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.6, type: "spring" }}
                >
                  {type.annual_fee.toLocaleString()} บาท/ปี
                </motion.div>
                <motion.ul 
                  className="mb-6 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                >
                  {type.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.8 + featureIndex * 0.1 }}
                    >
                      <motion.svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.9 + featureIndex * 0.1, type: "spring" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                      <span className="text-gray-600">{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.button
                  onClick={() => handleUpgradeClick(type.id, type.name, type.annual_fee)}
                  className="w-full block text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 1.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {!user ? 'เข้าสู่ระบบเพื่ออัพเกรด' : 'อัพเกรด'}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Additional Information Section */}
        <motion.div 
          className="bg-blue-50 py-12 md:py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-blue-900 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              ต้องการข้อมูลเพิ่มเติม?
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-700 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              หากคุณมีคำถามเกี่ยวกับประเภทสมาชิกหรือต้องการคำปรึกษา โปรดติดต่อเรา
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <motion.a 
                href="/contact" 
                className="inline-block bg-blue-900 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ติดต่อเรา
              </motion.a>
              <motion.a 
                href="/about" 
                className="inline-block bg-white text-blue-900 font-semibold px-8 py-3 rounded-full border-2 border-blue-900 hover:bg-blue-900 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                เรียนรู้เพิ่มเติม
              </motion.a>
            </motion.div>
          </div>
        </motion.div>

        <Footer />
      </motion.main>
    </>
  );
}