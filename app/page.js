'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import { services } from './data/services';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  // Show only first 6 services on home page
  const featuredServices = services.slice(0, 6);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <HeroSection
        title="สภาอุตสาหกรรมแห่งประเทศไทย"
        description={
          <>
            เป็นแกนกลางเสริมสร้างความเข้มแข็งและผลิตภาพอุตสาหกรรมไทย<br />
            ให้สามารถแข่งขันได้ในระดับสากล
          </>
        }
      >
        <div className="flex justify-center mt-8">
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            สมัครสมาชิก
          </Link>
        </div>
      </HeroSection>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">บริการของเรา</h2>
            <p className="text-lg text-gray-600">ครบครันด้วยบริการที่ตอบโจทย์ผู้ประกอบการอุตสาหกรรมไทย</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br ${service.color} text-white`}
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6"
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
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-white/80">{service.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out"
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
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
