'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Membership() {
  const router = useRouter();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  const handleUpgradeClick = (type, name, fee) => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/membership/upgrade?type=${type}&name=${encodeURIComponent(name)}&fee=${fee}`);
  };



  const membershipTypes = [
    {
      id: 'oc',
      name: 'สามัญ-โรงงาน',
      description: 'สน (OC)',
      annual_fee: 12000,
      features: [
        'สิทธิในการเข้าร่วมประชุมใหญ่',
        'สิทธิในการออกเสียงเลือกตั้ง',
        'รับข้อมูลข่าวสารจากภาคอุตสาหกรรม'
      ],
      highlight: true,
      path: '/membership/oc'
    },
    {
      id: 'am',
      name: 'สมาชิกสามัญ-โรงงาน',
      description: 'สส (AM)',
      annual_fee: 8000,
      features: [
        'สิทธิในการเข้าร่วมประชุมใหญ่',
        'รับข้อมูลข่าวสารจากภาคอุตสาหกรรม',
        'เครือข่ายธุรกิจอุตสาหกรรม'
      ],
      highlight: false,
      path: '/membership/am'
    },
    {
      id: 'ac',
      name: 'สมทบ-บุคคลธรรมดา',
      description: 'ทน (AC)',
      annual_fee: 6000,
      features: [
        'เข้าร่วมกิจกรรมของสภาอุตสาหกรรม',
        'รับข้อมูลข่าวสารจากภาคอุตสาหกรรม',
        'เครือข่ายธุรกิจอุตสาหกรรม'
      ],
      highlight: true,
      path: '/membership/ac'
    },
    {
      id: 'ic',
      name: 'สมทบ-นิติบุคคล',
      description: 'ทบ (IC)',
      annual_fee: 3000,
      features: [
        'เข้าร่วมกิจกรรมของสภาอุตสาหกรรม',
        'รับข้อมูลข่าวสารจากภาคอุตสาหกรรม',
        'เครือข่ายธุรกิจอุตสาหกรรม'
      ],
      highlight: false,
      path: '/membership/ic'
    }
  ];

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

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section - ใช้แบบเดียวกับ About และ Services */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* ลด decorative elements ในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          {/* Membership icon - ซ่อนในมือถือ */}
          {!isMobile && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 10H23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 16H8.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 16H16.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              ประเภทสมาชิก ส.อ.ท.
            </h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              เลือกประเภทสมาชิกที่เหมาะกับธุรกิจของคุณ
            </p>
          </div>
        </div>

        {/* Membership Cards Section */}
        <div className="container mx-auto px-4 py-16">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-12 text-center"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            แพ็กเกจสมาชิก
            <motion.div 
              className="w-16 h-1 bg-blue-600 mx-auto mt-3"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.h2>

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
                variants={fadeInUp}
                transition={{ delay: index * (isMobile ? 0.05 : 0.1) }}
              >
                {type.highlight && (
                  <div className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mb-2">
                    แนะนำ
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {type.description}
                </p>
                <div className="text-2xl font-bold mb-4 text-blue-600">
                  {type.annual_fee.toLocaleString()} บาท/ปี
                </div>
                <ul className="mb-6 space-y-2">
                  {type.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
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
                <Link
                  href={type.path}
                  className="w-full block text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  สมัครสมาชิก
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-blue-50 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-blue-900 mb-6"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              ต้องการข้อมูลเพิ่มเติม?
              <motion.div 
                className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-700 mb-8"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              หากคุณมีคำถามเกี่ยวกับประเภทสมาชิกหรือต้องการคำปรึกษา โปรดติดต่อเรา
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <a 
                href="/contact" 
                className="inline-block bg-white text-blue-900 font-semibold px-8 py-3 rounded-full border-2 border-blue-900 hover:bg-blue-900 hover:text-white transition-colors"
              >
                เรียนรู้เพิ่มเติม
              </a>
            </motion.div>
          </div>
        </div>


      </main>
      <Footer />
    </>
  );
}