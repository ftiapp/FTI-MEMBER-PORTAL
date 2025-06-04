'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CookieManager from '../utils/cookieManager';

export default function CookieSettings({ onClose, onSave }) {
  // Ensure we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  const [showFullText, setShowFullText] = useState(false);
  const [cookieSettings, setCookieSettings] = useState({
    functionality: false,
    performance: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // โหลดการตั้งค่าปัจจุบัน
    if (isBrowser) {
      const preferences = CookieManager.getPreferences();
      if (preferences) {
        setCookieSettings({
          functionality: preferences.functionality || false,
          performance: preferences.performance || false,
          analytics: preferences.analytics || false,
          marketing: preferences.marketing || false
        });
      }
    }
  }, [isBrowser]);

  const handleToggleSetting = (type) => {
    setCookieSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSave = () => {
    if (isBrowser) {
      // เพิ่มการตั้งค่าคุกกี้ที่จำเป็นเสมอ
      const updatedSettings = {
        ...cookieSettings,
        essential: true // คุกกี้ที่จำเป็นต้องเปิดใช้งานเสมอ
      };
      
      // บันทึกการตั้งค่าคุกกี้โดยใช้ CookieManager
      CookieManager.savePreferences(updatedSettings, 'custom');
      
      // Call the onSave callback with updated settings
      onSave(updatedSettings);
      return;
    }
    
    // Call the onSave callback
    onSave(cookieSettings);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 pt-16 sm:pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto mt-12 sm:mt-0"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              การตั้งค่าความเป็นส่วนตัว
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="ปิด"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                เมื่อท่านเข้าชมเว็บไซต์ของ สภาอุตสาหกรรมแห่งประเทศไทย อาจมีการจัดเก็บหรือดึงข้อมูลจากเบราว์เซอร์ของท่านในรูปแบบของคุกกี้ ข้อมูลเหล่านี้อาจเป็นข้อมูลเกี่ยวกับท่าน ความชอบของท่าน หรืออุปกรณ์ของท่าน ซึ่งส่วนมากจะถูกใช้เพื่อให้เว็บไซต์สามารถทำงานได้ตามที่ท่านคาดหวัง
              </p>
              
              <AnimatePresence>
                {showFullText && (
                  <motion.div
                    id="cookie-policy-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 mt-2">
                      ข้อมูลเหล่านี้มักไม่ได้ระบุตัวตนท่านอย่างเฉพาะเจาะจง แต่สามารถให้ประสบการณ์การใช้งานเว็บแบบปรับแต่งเฉพาะสำหรับท่านมากขึ้น สภาอุตสาหกรรมแห่งประเทศไทย เคารพในสิทธิความเป็นส่วนตัวของท่าน โดยท่านสามารถเลือกปฏิเสธคุกกี้บางประเภทที่ไม่จำเป็นต่อการทำงานของเว็บไซต์ได้ ทั้งนี้ การปิดการใช้งานคุกกี้บางประเภทอาจส่งผลกระทบต่อประสบการณ์การใช้งานเว็บไซต์ สภาอุตสาหกรรมแห่งประเทศไทย สถาบันเพิ่มผลผลิตแห่งชาติ สภาอุตสาหกรรมแห่งประเทศไทย ได้เสนอให้ท่านได้ นโยบายความเป็นส่วนตัว และ ข้อกำหนดการใช้งาน เพื่อสำหรับการบริการที่สามารถใช้งานได้บริการที่ดีและสะประเภทเพื่อเรียนรู้เพิ่มเติมและปรับเปลี่ยนการตั้งค่าได้
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors mt-2 inline-block"
                aria-expanded={showFullText}
                aria-controls="cookie-policy-details"
              >
                {showFullText ? 'แสดงน้อยลง' : 'แสดงเพิ่มเติม'}
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    คุกกี้ที่มีความจำเป็น (Necessary Cookies)
                  </h3>
                  <p className="text-sm text-gray-500">
                    คุกกี้เหล่านี้จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์ รวมถึงคุกกี้สำหรับการเข้าสู่ระบบ การจดจำข้อมูลผู้ใช้ และการรักษาสถานะการเข้าสู่ระบบ
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <span className="text-sm text-gray-500 mr-3">Always Enabled</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                  </div>
                </div>
              </div>

              {/* Functionality Cookies */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    คุกกี้ช่วยเหลือในการทำงาน (Functionality Cookies)
                  </h3>
                  <p className="text-sm text-gray-500">
                    ช่วยให้เว็บไซต์จดจำการตั้งค่าและความชอบของคุณ
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <span className="text-sm text-gray-500 mr-3">
                    {cookieSettings.functionality ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleSetting('functionality')}
                    className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      cookieSettings.functionality ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${
                      cookieSettings.functionality ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Performance Cookies */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    คุกกี้ประสิทธิภาพ (Performance Cookies)
                  </h3>
                  <p className="text-sm text-gray-500">
                    ช่วยปรับปรุงประสิทธิภาพและความเร็วของเว็บไซต์
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <span className="text-sm text-gray-500 mr-3">
                    {cookieSettings.performance ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleSetting('performance')}
                    className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      cookieSettings.performance ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${
                      cookieSettings.performance ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    คุกกี้เพื่อการวิเคราะห์ (Analytical Cookies)
                  </h3>
                  <p className="text-sm text-gray-500">
                    ช่วยวิเคราะห์การใช้งานเว็บไซต์เพื่อปรับปรุงบริการ
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <span className="text-sm text-gray-500 mr-3">
                    {cookieSettings.analytics ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleSetting('analytics')}
                    className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      cookieSettings.analytics ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${
                      cookieSettings.analytics ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    คุกกี้เพื่อการโฆษณาและการตลาด (Advertisement Cookies)
                  </h3>
                  <p className="text-sm text-gray-500">
                    ใช้เพื่อแสดงโฆษณาที่เหมาะสมกับความสนใจของคุณ
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  <span className="text-sm text-gray-500 mr-3">
                    {cookieSettings.marketing ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => handleToggleSetting('marketing')}
                    className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      cookieSettings.marketing ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${
                      cookieSettings.marketing ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              SAVE & ACCEPT
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}