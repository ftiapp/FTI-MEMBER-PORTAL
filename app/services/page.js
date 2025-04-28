'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { services } from '../data/services';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 9;

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: i => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.05,
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      } 
    }),
    hover: { 
      y: -10, 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15 
      } 
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 10 
      } 
    },
    tap: { 
      scale: 0.95 
    },
    active: {
      scale: 1.05,
      backgroundColor: "#2563EB",
      color: "#FFFFFF",
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <HeroSection 
        title="บริการของเรา"
        subtitle="บริการครบวงจรเพื่อผู้ประกอบการไทย"
      >
        <motion.p 
          className="mt-4 text-lg text-blue-100 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          สภาอุตสาหกรรมแห่งประเทศไทยมีบริการหลากหลายที่ออกแบบมาเพื่อช่วยเหลือและสนับสนุนผู้ประกอบการอุตสาหกรรมไทย
          ให้เติบโตอย่างยั่งยืนในตลาดที่มีการแข่งขันสูง
        </motion.p>
      </HeroSection>
      
      <div className="container mx-auto px-4 py-12">
        {/* Search and Categories */}
        <motion.div 
          className="mb-10 bg-white rounded-2xl shadow-lg p-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="max-w-xl mx-auto mb-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative">
              <motion.input
                type="text"
                placeholder="ค้นหาบริการ..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 shadow-sm transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                initial={{ opacity: 0, width: "90%" }}
                animate={{ opacity: 1, width: "100%" }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileFocus={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)" }}
              />
              <motion.svg
                className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </motion.svg>
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-wrap gap-3 justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                variants={buttonVariants}
                initial="hidden"
                animate={activeCategory === category.id ? "active" : "visible"}
                whileHover="hover"
                whileTap="tap"
                custom={index}
                transition={{ delay: 0.1 * index }}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mt-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {currentServices.length > 0 ? (
            currentServices.map((service, index) => (
              <motion.div
                key={service.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden group"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={index}
                layoutId={`service-card-${service.id}`}
              >
                <div className="flex flex-col h-full">
                  <motion.div 
                    className={`w-full h-16 ${service.color} flex items-center px-6`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div 
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <motion.svg
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
                        initial={{ opacity: 0, rotate: -30 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d={service.icon}
                        />
                      </motion.svg>
                    </motion.div>
                  </motion.div>
                  <div className="p-6 flex-grow">
                    <motion.h3 
                      className="text-xl font-semibold mb-3 text-gray-800"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {service.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {service.description}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="col-span-3 py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ 
                  scale: { delay: 0.3, duration: 0.5 },
                  rotate: { delay: 0.5, duration: 1.5, ease: "easeInOut" }
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </motion.svg>
              <motion.h3 
                className="text-xl font-medium text-gray-900 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                ไม่พบบริการที่ค้นหา
              </motion.h3>
              <motion.p 
                className="text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ลองค้นหาด้วยคำหรือหมวดหมู่อื่น
              </motion.p>
            </motion.div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center mt-12 mb-8 gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <motion.button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-5 py-3 rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-gray-200 hover:border-blue-300'
              }`}
              whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
              whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              ก่อนหน้า
            </motion.button>
            
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                // Show only 5 page buttons with ellipsis for long paginations
                if (
                  totalPages <= 7 ||
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 2 && index <= currentPage + 1)
                ) {
                  return (
                    <motion.button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all duration-200 ${
                        currentPage === index + 1
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {index + 1}
                    </motion.button>
                  );
                } else if (
                  index === 1 ||
                  index === totalPages - 2
                ) {
                  return <span key={`ellipsis-${index}`} className="flex items-center justify-center text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            
            <motion.button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-5 py-3 rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-gray-200 hover:border-blue-300'
              }`}
              whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
              whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
            >
              ถัดไป
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </div>
      <Footer />
    </motion.div>
  );
}