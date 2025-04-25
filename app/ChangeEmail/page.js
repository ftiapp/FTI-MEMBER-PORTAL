'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import RequestOTP from './components/RequestOTP';
import VerifyOTP from './components/VerifyOTP';
import ConfirmNewEmail from './components/ConfirmNewEmail';
import SuccessMessage from './components/SuccessMessage';

export default function ChangeEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-custom py-8">
          <motion.div 
            className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const goToNextStep = (data) => {
    if (data && data.token) {
      setToken(data.token);
    }
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RequestOTP userEmail={user.email} onSuccess={goToNextStep} />;
      case 2:
        return <VerifyOTP userId={user.id} onSuccess={goToNextStep} onBack={goToPreviousStep} />;
      case 3:
        return <ConfirmNewEmail userId={user.id} token={token} onSuccess={goToNextStep} onBack={goToPreviousStep} />;
      case 4:
        return <VerifyOTP userId={user.id} onSuccess={goToNextStep} onBack={goToPreviousStep} title="ขั้นตอนที่ 4: ยืนยัน OTP ที่ส่งไปยังอีเมลใหม่" description="กรุณาตรวจสอบอีเมลใหม่ของท่านและกรอกรหัส OTP ที่ได้รับ" isNewEmail={true} />;
      case 5:
        return <SuccessMessage />;
      default:
        return <RequestOTP userEmail={user.email} onSuccess={goToNextStep} />;
    }
  };

  // Animation variants for step indicators
  const stepVariants = {
    active: { scale: 1.1, backgroundColor: '#2563EB', color: '#FFFFFF', transition: { duration: 0.3 } },
    inactive: { scale: 1, backgroundColor: '#E5E7EB', color: '#000000', transition: { duration: 0.3 } },
    completed: { scale: 1, backgroundColor: '#2563EB', color: '#FFFFFF', transition: { duration: 0.3 } }
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className="min-h-screen bg-gray-50 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Toaster position="top-right" />
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">แจ้งเปลี่ยนอีเมลล์</h1>
            </div>
            
            {/* คำอธิบายวิธีใช้งาน */}
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">วิธีการเปลี่ยนอีเมล</h2>
              <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                <li>ขอรหัส OTP ที่จะส่งไปยังอีเมลปัจจุบันของท่าน</li>
                <li>กรอกรหัส OTP ที่ได้รับทางอีเมลเพื่อยืนยันตัวตน</li>
                <li>กรอกอีเมลใหม่ที่ท่านต้องการใช้งาน</li>
                <li>กรอกรหัส OTP ที่ส่งไปยังอีเมลใหม่ของท่าน</li>
                <li>เสร็จสิ้นการเปลี่ยนอีเมล</li>
              </ol>
              <p className="text-xs text-red-600 mt-2">หมายเหตุ: หลังจากเปลี่ยนอีเมลสำเร็จ ท่านจะต้องรอ 7 วันก่อนที่จะสามารถเปลี่ยนอีเมลได้อีกครั้ง</p>
            </div>
            
            {/* Progress Steps */}
            <div className="p-6 border-b">
              <div className="mb-2">
                <div className="flex items-center">
                  <motion.div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    variants={stepVariants}
                    initial="inactive"
                    animate={currentStep >= 1 ? "completed" : "inactive"}
                  >
                    1
                  </motion.div>
                  <motion.div 
                    className="flex-1 h-1 mx-2"
                    initial={{ backgroundColor: "#E5E7EB" }}
                    animate={{ backgroundColor: currentStep >= 2 ? "#2563EB" : "#E5E7EB" }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                  <motion.div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    variants={stepVariants}
                    initial="inactive"
                    animate={currentStep >= 2 ? "completed" : currentStep === 2 ? "active" : "inactive"}
                  >
                    2
                  </motion.div>
                  <motion.div 
                    className="flex-1 h-1 mx-2"
                    initial={{ backgroundColor: "#E5E7EB" }}
                    animate={{ backgroundColor: currentStep >= 3 ? "#2563EB" : "#E5E7EB" }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                  <motion.div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    variants={stepVariants}
                    initial="inactive"
                    animate={currentStep >= 3 ? "completed" : currentStep === 3 ? "active" : "inactive"}
                  >
                    3
                  </motion.div>
                  <motion.div 
                    className="flex-1 h-1 mx-2"
                    initial={{ backgroundColor: "#E5E7EB" }}
                    animate={{ backgroundColor: currentStep >= 4 ? "#2563EB" : "#E5E7EB" }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                  <motion.div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    variants={stepVariants}
                    initial="inactive"
                    animate={currentStep >= 4 ? "completed" : currentStep === 4 ? "active" : "inactive"}
                  >
                    4
                  </motion.div>
                  <motion.div 
                    className="flex-1 h-1 mx-2"
                    initial={{ backgroundColor: "#E5E7EB" }}
                    animate={{ backgroundColor: currentStep >= 5 ? "#2563EB" : "#E5E7EB" }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                  <motion.div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    variants={stepVariants}
                    initial="inactive"
                    animate={currentStep >= 5 ? "completed" : currentStep === 5 ? "active" : "inactive"}
                  >
                    5
                  </motion.div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 px-1 mb-6">
                <div className="text-center" style={{ marginLeft: '-12px', width: '60px' }}>ขอรหัส OTP</div>
                <div className="text-center" style={{ width: '60px' }}>ยืนยัน OTP</div>
                <div className="text-center" style={{ width: '70px' }}>กรอกอีเมลใหม่</div>
                <div className="text-center" style={{ width: '70px' }}>ยืนยัน OTP อีเมลใหม่</div>
                <div className="text-center" style={{ marginRight: '-12px', width: '60px' }}>เสร็จสิ้น</div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}