'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { services } from './data/services';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show only first 6 services on home page
  const featuredServices = services.slice(0, 6);

  // Simple animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
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
        {/* Hero Section */}
        <motion.div 
          className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements - ซ่อนในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          {/* Home/Building icon - ซ่อนในมือถือ */}
          {!isMobile && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-blue-800 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <motion.h1 
              className="text-3xl md:text-5xl font-bold mb-4 text-center"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              สภาอุตสาหกรรมแห่งประเทศไทย
            </motion.h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <motion.p 
              className="text-lg md:text-xl text-center max-w-3xl mx-auto"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              เป็นแกนกลางเสริมสร้างความเข้มแข็งและผลิตภาพอุตสาหกรรมไทย<br />
              ให้สามารถแข่งขันได้ในระดับสากล
            </motion.p>
            
            <motion.div 
              className="flex justify-center mt-8"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/register"
                className="inline-block px-8 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                สมัครสมาชิก
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                บริการของเรา
              </h2>
              <p className="text-lg text-gray-600">
                ครบครันด้วยบริการที่ตอบโจทย์ผู้ประกอบการอุตสาหกรรมไทย
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {featuredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  variants={fadeIn}
                >
                  <div className="flex flex-col h-full">
                    <div className={`w-full h-16 ${service.color} flex items-center px-6`}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                        <svg
                          className={`w-6 h-6 ${service.color.includes('blue') ? 'text-blue-500' : 
                                     service.color.includes('green') ? 'text-green-500' : 
                                     service.color.includes('purple') ? 'text-purple-500' : 
                                     service.color.includes('yellow') ? 'text-yellow-500' : 
                                     service.color.includes('red') ? 'text-red-500' : 
                                     service.color.includes('indigo') ? 'text-indigo-500' : 
                                     service.color.includes('pink') ? 'text-pink-500' : 
                                     service.color.includes('teal') ? 'text-teal-500' : 
                                     service.color.includes('orange') ? 'text-orange-500' : 'text-gray-500'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d={service.icon}
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="text-center mt-12"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/services"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                ดูบริการทั้งหมด
                <svg
                  className="ml-2 -mr-1 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>
      </motion.main>
      <Footer />
    </>
  );
}