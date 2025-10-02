"use client";

import { useState, useEffect } from "react";
import CookieSettings from "./CookieSettings";
import CookieManager from "../utils/cookieManager";
import styles from "./CookieSettingsButton.module.css";

/**
 * ปุ่มตั้งค่าคุกกี้ที่แสดงที่มุมขวาของหน้าเว็บ
 * จะแสดงเฉพาะเมื่อผู้ใช้ได้ตั้งค่าคุกกี้แล้ว (banner หายไป)
 */
export default function CookieSettingsButton() {
  const [showSettings, setShowSettings] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  // ตรวจสอบว่ามีการตั้งค่าคุกกี้แล้วหรือไม่
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ตรวจสอบเมื่อโหลดครั้งแรก
    setHasConsent(CookieManager.hasConsent());

    // ตรวจสอบการเปลี่ยนแปลงของคุกกี้
    const checkConsentStatus = () => {
      setHasConsent(CookieManager.hasConsent());
    };

    // ตั้งค่า event listener สำหรับการเปลี่ยนแปลงคุกกี้
    window.addEventListener("cookieConsentChanged", checkConsentStatus);

    // เคลียร์ event listener เมื่อ component unmount
    return () => {
      window.removeEventListener("cookieConsentChanged", checkConsentStatus);
    };
  }, []);

  const openSettings = () => {
    setShowSettings(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const handleSaveSettings = (settings) => {
    // บันทึกการตั้งค่าคุกกี้
    CookieManager.savePreferences(settings, "custom");
    closeSettings();
  };

  // ไม่แสดงปุ่มถ้ายังไม่มีการตั้งค่าคุกกี้
  if (!hasConsent) return null;

  return (
    <>
      <button className={styles.cookieButton} onClick={openSettings} aria-label="ตั้งค่าคุกกี้">
        <span className={styles.cookieIcon}>🍪</span>
        <span className={styles.cookieText}>ตั้งค่าคุกกี้</span>
      </button>

      {showSettings && <CookieSettings onClose={closeSettings} onSave={handleSaveSettings} />}
    </>
  );
}
