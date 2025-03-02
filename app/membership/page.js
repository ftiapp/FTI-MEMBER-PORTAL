'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';

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

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <HeroSection
        title="ประเภทสมาชิก ส.อ.ท."
        description="เลือกประเภทสมาชิกที่เหมาะกับธุรกิจของคุณ"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {membershipTypes.map((type) => (
            <div
              key={type.id}
              className={`bg-white rounded-lg shadow-lg p-6 ${
                type.highlight ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{type.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{type.description}</p>
              <div className="text-2xl font-bold mb-4 text-blue-600">
                {type.annual_fee.toLocaleString()} บาท/ปี
              </div>
              <ul className="mb-6 space-y-2">
                {type.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
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
              <button
                onClick={() => handleUpgradeClick(type.id, type.name, type.annual_fee)}
                className="w-full block text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {!user ? 'เข้าสู่ระบบเพื่ออัพเกรด' : 'อัพเกรด'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
