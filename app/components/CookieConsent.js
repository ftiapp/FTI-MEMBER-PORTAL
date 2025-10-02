"use client";

import { useState, useEffect } from "react";
import CookieManager from "../utils/cookieManager";
import CookieSettings from "./CookieSettings.js";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
      essential: true, // จำเป็นต้องเปิดใช้งานเสมอ
    };

    setIsClosing(true);

    // ใช้ CookieManager เพื่อบันทึกการตั้งค่าทั้งหมด
    CookieManager.savePreferences(allAccepted, "all");

    // ส่ง event เพื่อแจ้งว่ามีการเปลี่ยนแปลงการตั้งค่าคุกกี้
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookieConsentChanged"));
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
      essential: true, // คุกกี้ที่จำเป็นต้องเปิดใช้งานเสมอ
    };

    // ใช้ CookieManager เพื่อบันทึกการตั้งค่าแบบกำหนดเอง
    CookieManager.savePreferences(updatedSettings, "custom");

    // ส่ง event เพื่อแจ้งว่ามีการเปลี่ยนแปลงการตั้งค่าคุกกี้
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookieConsentChanged"));
    }

    setTimeout(() => {
      setShowConsent(false);
      setShowSettings(false);
      setIsClosing(false);
    }, 300);
  };

  const handleViewPrivacyPolicy = () => {
    window.open("/privacy-policy", "_blank");
  };

  const handleViewTermsOfService = () => {
    window.open("/terms-of-service", "_blank");
  };

  return (
    <>
      {/* Cookie Settings Modal */}
      {showSettings && <CookieSettings onClose={handleCloseSettings} onSave={handleSaveSettings} />}

      {/* Cookie Consent Banner */}
      {showConsent && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-slate-800 shadow-2xl z-50 border-t border-slate-700 transition-all duration-300 ease-out will-change-transform ${isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* ปุ่มตั้งค่าคุกกี้ (ย้ายมาทางซ้าย) */}
              <div className="flex flex-row gap-3 w-full md:w-auto md:flex-shrink-0 order-2 md:order-1">
                <button
                  onClick={handleOpenSettings}
                  className="px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  ตั้งค่าคุกกี้
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm"
                >
                  ยอมรับทั้งหมด
                </button>
              </div>

              {/* ข้อความ (ย้ายมาทางขวา) */}
              <div className="flex-1 text-sm text-gray-100 leading-relaxed order-1 md:order-2">
                <p className="mb-2 md:mb-0 text-xs sm:text-sm">
                  <span className="font-medium text-white">สภาอุตสาหกรรมแห่งประเทศไทย</span>{" "}
                  ใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานเว็บไซต์
                  คุณสามารถเลือกยอมรับหรือปฏิเสธคุกกี้ที่ไม่จำเป็นได้
                </p>

                {/* ลิงค์นโยบาย */}
                <div className="flex flex-wrap gap-1 text-xs">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
