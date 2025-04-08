'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CheckEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    // นับถอยหลัง 20 วินาที
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // เมื่อนับถอยหลังเสร็จ ให้นำผู้ใช้ไปยังหน้า login
          // ใช้ setTimeout เพื่อหลีกเลี่ยงการเรียกใช้ router.push() ในระหว่างการเรนเดอร์
          setTimeout(() => {
            router.push('/login');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // ล้าง timer เมื่อ component unmount
    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="container-custom">
          <div className="py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ยืนยันอีเมลของท่าน
            </h1>
            <p className="text-lg md:text-xl text-blue-100">
              กรุณาตรวจสอบอีเมลของท่านเพื่อยืนยันการสมัครสมาชิก
            </p>
          </div>
        </div>
      </section>

      {/* Email Verification Instructions */}
      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">กรุณาตรวจสอบอีเมลของท่าน</h2>
              
              {email && (
                <p className="text-lg text-blue-600 font-medium mb-4">
                  {email}
                </p>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700">
                  เราได้ส่งอีเมลยืนยันไปยังอีเมลของท่าน กรุณาตรวจสอบและคลิกที่ลิงก์ในอีเมลเพื่อยืนยันการสมัครสมาชิก
                </p>
                <p className="text-gray-700 mt-2">
                  หากไม่พบอีเมลในกล่องจดหมาย กรุณาตรวจสอบในโฟลเดอร์ Junk Mail หรือ Spam
                </p>
              </div>
              
              <div className="text-gray-600 mb-6">
                <p>กำลังนำท่านไปยังหน้าเข้าสู่ระบบใน <span className="font-bold text-blue-600">{countdown}</span> วินาที</p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-colors">
                  ไปที่หน้าเข้าสู่ระบบ
                </Link>
                <Link href="/" className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg px-5 py-2.5 transition-colors">
                  กลับหน้าหลัก
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
