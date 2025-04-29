'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';

export default function RequestOTP({ userEmail, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [nextAvailableDate, setNextAvailableDate] = useState(null);
  const [daysToWait, setDaysToWait] = useState(0);
  
  const recaptchaRef = useRef(null);

  // แสดง Captcha เมื่อกดปุ่มขอเปลี่ยนอีเมล
  const handleShowCaptcha = () => {
    setShowCaptcha(true);
    setErrorMessage('');
  };
  
  // ตรวจสอบ Captcha
  const handleCaptchaChange = (value) => {
    if (value) {
      setCaptchaVerified(true);
    } else {
      setCaptchaVerified(false);
    }
  };
  
  // รีเซ็ต Captcha
  const resetCaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setCaptchaVerified(false);
  };

  // ส่งคำขอเปลี่ยนอีเมล
  const handleRequest = async () => {
    if (!captchaVerified) {
      setErrorMessage('กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/user/request-change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRequested(true);
        toast.success('ส่งรหัส OTP ไปยังอีเมลของท่านเรียบร้อยแล้ว');
        
        // ส่งข้อมูลกลับไปยัง parent component เพื่อไปยังขั้นตอนถัดไป
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        if (data.cooldownDays) {
          setCooldown(data.cooldownDays);
          setNextAvailableDate(data.nextAvailableDate);
          setDaysToWait(data.daysToWait);
          toast.error(`ท่านได้เปลี่ยนอีเมลไปเมื่อไม่นานนี้ กรุณารอ ${data.daysToWait} วัน`);
        } else if (data.cooldownMinutes) {
          setOtpCooldown(data.cooldownMinutes);
          toast.error(`ท่านได้ขอรหัส OTP ไปเมื่อไม่นานนี้ กรุณารอ ${data.cooldownMinutes} นาที`);
        } else {
          setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการส่งรหัส OTP');
          toast.error(data.error || 'เกิดข้อผิดพลาดในการส่งรหัส OTP');
        }
        resetCaptcha();
      }
    } catch (error) {
      setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  if (cooldown > 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <p className="font-bold">ไม่สามารถเปลี่ยนอีเมลได้ในขณะนี้</p>
            <p>ท่านได้เปลี่ยนอีเมลไปเมื่อไม่นานนี้ กรุณารอ {daysToWait} วัน</p>
            {nextAvailableDate && (
              <p className="mt-2">ท่านจะสามารถเปลี่ยนอีเมลได้อีกครั้งในวันที่: {nextAvailableDate}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (otpCooldown > 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
            <p className="font-bold">ไม่สามารถขอรหัส OTP ได้ในขณะนี้</p>
            <p>ท่านได้ขอรหัส OTP ไปเมื่อไม่นานนี้ กรุณารอ {otpCooldown} นาที</p>
            <p className="mt-2">เพื่อป้องกันการส่งอีเมลมากเกินไป ระบบจำกัดการขอรหัส OTP ทุก 5 นาที</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">ขั้นตอนที่ 1: ขอรหัส OTP</h2>
        <p className="text-gray-600 mb-4">
          ระบบจะส่งรหัส OTP ไปยังอีเมลปัจจุบันของท่านเพื่อยืนยันตัวตน
        </p>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 mb-2">อีเมลปัจจุบันของท่าน:</p>
          <p className="font-medium text-gray-800">{userEmail}</p>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{errorMessage}</p>
          </div>
        )}

        {!showCaptcha ? (
          <button
            onClick={handleShowCaptcha}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={loading}
          >
            ขอรหัส OTP
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key
                onChange={handleCaptchaChange}
              />
            </div>
            
            <button
              onClick={handleRequest}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !captchaVerified}
            >
              {loading ? 'กำลังส่งรหัส OTP...' : 'ยืนยันและส่งรหัส OTP'}
            </button>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          <p>หมายเหตุ: หลังจากเปลี่ยนอีเมลสำเร็จ ท่านจะต้องรอ 7 วันก่อนที่จะสามารถเปลี่ยนอีเมลได้อีกครั้ง</p>
        </div>
      </div>
    </div>
  );
}
