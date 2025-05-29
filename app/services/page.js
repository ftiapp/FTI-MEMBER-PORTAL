'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { services } from '../data/services';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const servicesPerPage = 9;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories = [
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'business', name: 'ธุรกิจและการลงทุน' },
    { id: 'training', name: 'อบรมและสัมมนา' },
    { id: 'certification', name: 'รับรองมาตรฐาน' },
    { id: 'consulting', name: 'ให้คำปรึกษา' },
    { id: 'international', name: 'ต่างประเทศ' },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {/* Hero Section - ใช้แบบเดียวกับ About */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
          {/* ลด decorative elements ในมือถือ */}
          {!isMobile && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 -ml-20 -mb-20"></div>
            </>
          )}
          
          {/* Service icon - ซ่อนในมือถือ */}
          {!isMobile && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block opacity-15">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 19V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 19V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 12C20.6569 12 22 10.6569 22 9C22 7.34315 20.6569 6 19 6C17.3431 6 16 7.34315 16 9C16 10.6569 17.3431 12 19 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12C6.65685 12 8 10.6569 8 9C8 7.34315 6.65685 6 5 6C3.34315 6 2 7.34315 2 9C2 10.6569 3.34315 12 5 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          
          <div className="container mx-auto px-4 relative z-10 max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
              บริการของเรา
            </h1>
            <motion.div 
              className="w-24 h-1 bg-white mx-auto mb-6"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              บริการครบวงจรเพื่อผู้ประกอบการไทย
            </p>
            <p className="mt-4 text-lg text-blue-100 max-w-3xl mx-auto text-center">
              สภาอุตสาหกรรมแห่งประเทศไทยมีบริการหลากหลายที่ออกแบบมาเพื่อช่วยเหลือและสนับสนุนผู้ประกอบการอุตสาหกรรมไทย
              ให้เติบโตอย่างยั่งยืนในตลาดที่มีการแข่งขันสูง
            </p>
          </div>
        </div>
      
        <div className="container mx-auto px-4 py-12">
          {/* Search and Categories */}
          <motion.div 
            className="mb-10 bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-5xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              ค้นหาบริการ
              <motion.div 
                className="w-16 h-1 bg-blue-600 mx-auto mt-3"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </h2>
            
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาบริการ..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 shadow-sm transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Services Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mt-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {currentServices.length > 0 ? (
              currentServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                  variants={fadeInUp}
                  transition={{ delay: index * (isMobile ? 0.05 : 0.1) }}
                >
                  <div className="flex flex-col h-full">
                    <div className={`w-full h-16 ${service.color} flex items-center px-6`}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                        <svg
                          className={`w-6 h-6 ${
                            service.color.includes('blue') ? 'text-blue-500' : 
                            service.color.includes('green') ? 'text-green-500' : 
                            service.color.includes('purple') ? 'text-purple-500' : 
                            service.color.includes('yellow') ? 'text-yellow-500' : 
                            service.color.includes('red') ? 'text-red-500' : 
                            service.color.includes('indigo') ? 'text-indigo-500' : 
                            service.color.includes('pink') ? 'text-pink-500' : 
                            service.color.includes('teal') ? 'text-teal-500' : 
                            service.color.includes('orange') ? 'text-orange-500' : 'text-gray-500'
                          }`}
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
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  ไม่พบบริการที่ค้นหา
                </h3>
                <p className="text-gray-500">
                  ลองค้นหาด้วยคำหรือหมวดหมู่อื่น
                </p>
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 mb-8 gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 md:px-5 py-2 md:py-3 rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                ก่อนหน้า
              </button>
              
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  if (
                    totalPages <= 7 ||
                    index === 0 ||
                    index === totalPages - 1 ||
                    (index >= currentPage - 2 && index <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-medium transition-all duration-200 text-sm md:text-base ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  } else if (index === 1 || index === totalPages - 2) {
                    return <span key={`ellipsis-${index}`} className="flex items-center justify-center text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 md:px-5 py-2 md:py-3 rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                ถัดไป
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}