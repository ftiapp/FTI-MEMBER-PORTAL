'use client';

import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <HeroSection 
        title="บริการของเรา"
        subtitle="บริการครบวงจรเพื่อผู้ประกอบการไทย"
      />
      
      <div className="container mx-auto px-4 py-12">
        {/* Search and Categories */}
        <div className="mb-10 bg-white rounded-2xl shadow-lg p-8 max-w-5xl mx-auto">
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
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm ${activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mt-8">
          {currentServices.length > 0 ? (
            currentServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:transform hover:scale-105"
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
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-16 text-center">
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
              <h3 className="text-xl font-medium text-gray-900 mb-2">ไม่พบบริการที่ค้นหา</h3>
              <p className="text-gray-500">ลองค้นหาด้วยคำหรือหมวดหมู่อื่น</p>
            </div>
          )}
        </div>
      {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 mb-8 gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-5 py-3 rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center ${
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
                // Show only 5 page buttons with ellipsis for long paginations
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
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all duration-200 ${
                        currentPage === index + 1
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
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
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-5 py-3 rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center ${
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
    </div>
  );
}
