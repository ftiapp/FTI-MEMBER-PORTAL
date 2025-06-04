'use client';

import { useState, useEffect } from 'react';
import CookieManager from '../utils/cookieManager';
import CookieSettings from './CookieSettings.js';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // ตรวจสอบว่ามีการยอมรับคุกกี้แล้วหรือไม่
    if (CookieManager.hasConsent()) {
      // ถ้ามีการยอมรับคุกกี้แล้ว ไม่ต้องแสดง banner
      const preferences = CookieManager.getPreferences();
      if (preferences) {
        // โหลดการตั้งค่าเข้าสู่ window object เพื่อให้ใช้งานได้ทันที
        window.COOKIE_PREFERENCES = preferences;
        window.cookiePreferences = JSON.stringify(preferences);
      }
    } else {
      // ถ้ายังไม่มีการยอมรับคุกกี้ ให้แสดง banner หลังจาก delay
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      functionality: true,
      performance: true,
      analytics: true,
      marketing: true,
      essential: true // จำเป็นต้องเปิดใช้งานเสมอ
    };
    
    setIsClosing(true);
    
    // ใช้ CookieManager เพื่อบันทึกการตั้งค่าทั้งหมด
    CookieManager.savePreferences(allAccepted, 'all');
    
    // ส่ง event เพื่อแจ้งว่ามีการเปลี่ยนแปลงการตั้งค่าคุกกี้
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cookieConsentChanged'));
    }
    
    setTimeout(() => {
      setShowConsent(false);
      setIsClosing(false);
    }, 300);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = (settings) => {
    setIsClosing(true);
    
    // เพิ่มการตั้งค่าคุกกี้ที่จำเป็นเสมอ
    const updatedSettings = {
      ...settings,
      essential: true // คุกกี้ที่จำเป็นต้องเปิดใช้งานเสมอ
    };
    
    // ใช้ CookieManager เพื่อบันทึกการตั้งค่าแบบกำหนดเอง
    CookieManager.savePreferences(updatedSettings, 'custom');
    
    // ส่ง event เพื่อแจ้งว่ามีการเปลี่ยนแปลงการตั้งค่าคุกกี้
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cookieConsentChanged'));
    }
    
    setTimeout(() => {
      setShowConsent(false);
      setShowSettings(false);
      setIsClosing(false);
    }, 300);
  };

  const handleViewPrivacyPolicy = () => {
    window.open('/privacy-policy', '_blank');
  };

  const handleViewTermsOfService = () => {
    window.open('/terms-of-service', '_blank');
  };

  return (
    <>
      {/* Cookie Settings Modal */}
      {showSettings && (
        <CookieSettings 
          onClose={handleCloseSettings}
          onSave={handleSaveSettings}
        />
      )}
      
      {/* Cookie Consent Banner */}
      {showConsent && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-slate-800 shadow-2xl z-50 border-t border-slate-700 transition-all duration-300 ease-out will-change-transform ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-5">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* ข้อความ */}
                <div className="flex-1 text-sm sm:text-base text-gray-100 leading-relaxed">
                  <p className="mb-3 lg:mb-0">
                    <span className="font-medium text-white">สภาอุตสาหกรรมแห่งประเทศไทย (ส.อ.ท.)</span> ใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานเว็บไซต์ วิเคราะห์การเข้าชม และเพิ่มประสิทธิภาพการให้บริการ คุณสามารถเลือกยอมรับหรือปฏิเสธคุกกี้ที่ไม่จำเป็นได้
                  </p>
                  
                  {/* ลิงค์นโยบาย */}
                  <div className="flex flex-wrap gap-1 text-xs sm:text-sm lg:inline">
                    <span className="text-gray-300">อ่านเพิ่มเติม:</span>
                    <button 
                      onClick={handleViewPrivacyPolicy}
                      className="text-blue-300 hover:text-blue-200 hover:underline font-medium transition-colors"
                    >
                      นโยบายความเป็นส่วนตัว
                    </button>
                    <span className="text-gray-400">|</span>
                    <button 
                      onClick={handleViewTermsOfService}
                      className="text-blue-300 hover:text-blue-200 hover:underline font-medium transition-colors"
                    >
                      ข้อกำหนดการใช้งาน
                    </button>
                  </div>
                </div>

                {/* ปุ่ม */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-shrink-0">
                  <button
                    onClick={handleOpenSettings}
                    className="px-4 py-2.5 text-sm font-medium text-slate-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                  >
                    ตั้งค่าคุกกี้
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm"
                  >
                    ยอมรับทั้งหมด
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}
    </>
  );
}