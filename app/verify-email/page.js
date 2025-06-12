// app/verify-email/page.js - Main Entry Point
'use client';

import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import VerifyEmailHero from './components/VerifyEmailHero';
import VerificationCard from './components/VerificationCard';
import { useVerification } from './components/useVerification';
import { useMobile } from './components/useMobile';
import { fadeInUp } from './components/animations';

export default function VerifyEmail() {
  const isMobile = useMobile();
  const {
    verificationStatus,
    message,
    isSubmitting,
    countdown,
    isInitialized,
    handleVerify,
    handleResendSuccess
  } = useVerification();

  if (!isInitialized) {
    return <LoadingSpinner message="กำลังโหลด..." />;
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <VerifyEmailHero isMobile={isMobile} />

      {/* Verification Status */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            สถานะการยืนยัน
            <motion.div 
              className="w-16 h-1 bg-blue-600 mx-auto mt-3"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.h2>

          <div className="max-w-xl mx-auto">
            <VerificationCard
              verificationStatus={verificationStatus}
              message={message}
              isSubmitting={isSubmitting}
              onVerify={handleVerify}
              countdown={countdown}
              onResendSuccess={handleResendSuccess}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}