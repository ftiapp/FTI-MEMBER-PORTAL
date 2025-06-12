// useVerification.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useVerification() {
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [message, setMessage] = useState('กำลังตรวจสอบโทเค็น...');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize component
  useEffect(() => {
    if (isInitialized) return;

    const initializeComponent = () => {
      try {
        const emailVerified = typeof window !== 'undefined' ? sessionStorage.getItem('emailVerified') : null;
        
        if (emailVerified === 'true') {
          setVerificationStatus('success');
          setMessage('ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
          sessionStorage.removeItem('emailVerified');
          setIsInitialized(true);
          return;
        }

        const tokenFromUrl = searchParams.get('token');
        
        if (!tokenFromUrl) {
          setVerificationStatus('error');
          setMessage('ไม่พบโทเค็นยืนยัน กรุณาตรวจสอบลิงก์ที่ได้รับทางอีเมล');
          setIsInitialized(true);
          return;
        }

        setToken(tokenFromUrl);
        setVerificationStatus('ready');
        setMessage('กรุณากดปุ่มยืนยันอีเมลด้านล่างเพื่อยืนยันอีเมลของคุณ');
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setVerificationStatus('error');
        setMessage('เกิดข้อผิดพลาดในการโหลดหน้า');
        setIsInitialized(true);
      }
    };

    const timer = setTimeout(initializeComponent, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams, isInitialized]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(10);
  };

  const handleVerify = async () => {
    if (!token || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setVerificationStatus('verifying');
      setMessage('กำลังยืนยันอีเมลของคุณ...');
      
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
      }
      
      setTimeout(() => {
        setVerificationStatus('success');
        setMessage('ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว');
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('emailVerified', 'true');
        }
        
        startCountdown();
      }, 1000);
      
    } catch (error) {
      console.error('Verification error:', error);
      setTimeout(() => {
        setVerificationStatus('error');
        setMessage(error.message || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendSuccess = (successMessage) => {
    setVerificationStatus('success');
    setMessage(successMessage);
  };

  return {
    verificationStatus,
    message,
    isSubmitting,
    countdown,
    isInitialized,
    handleVerify,
    handleResendSuccess
  };
}