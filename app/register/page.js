'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import HeroSection from './components/HeroSection';
import RegisterForm from './components/RegisterForm';
import { useAuth } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isAuthenticated, user, router]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Custom Toast Container with enhanced positioning */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            zIndex: '9999 !important',
            position: 'fixed !important',
            top: '20px !important',
            right: '20px !important',
            maxWidth: '400px',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#f0fdf4',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2',
            },
          },
        }}
        containerStyle={{
          zIndex: '9999 !important',
          position: 'fixed !important',
          top: '20px !important',
          right: '20px !important',
        }}
      />

      <main className="min-h-screen bg-white">
        <Navbar />

        <HeroSection 
          title="สมัครสมาชิก"
          subtitle="เข้าร่วมเป็นส่วนหนึ่งของสภาอุตสาหกรรมแห่งประเทศไทย"
          isMobile={isMobile}
        />

        <RegisterForm />

        <Footer />
      </main>

      {/* Additional CSS for better toast positioning */}
      <style jsx global>{`
        .toast-notification {
          z-index: 9999 !important;
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
        }
        
        .Toaster__toast-container {
          z-index: 9999 !important;
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
        }
        
        .Toaster__toast {
          z-index: 9999 !important;
          position: relative !important;
          margin-bottom: 8px !important;
        }
        
        /* Make sure toasts are always visible */
        .Toaster__toast-container--top-right {
          top: 20px !important;
          right: 20px !important;
          z-index: 9999 !important;
        }
      `}</style>
    </>
  );
}